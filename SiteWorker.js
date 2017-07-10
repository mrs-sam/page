const amqp = require('amqplib');
const uri = require('urijs');
const Nightmare = require('nightmare');
const htmlAnalysis = require('./htmlAnalysis.js');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const winston = require('winston');

const CrawlerNode = require('./CrawlerNode.js').CrawlerNode;

class SiteWorker extends CrawlerNode {

    constructor(siteId, serverNames, show) {
        super(siteId, serverNames);
        this.show = show;
        this.workerId = uuidv4();
        this.queue = `urlOf${siteId}`;
        this.pageCollectionName = `Pages_${siteId}`;
        winston.info(`slave ${this.workerId}: created`);
    }

    start() {
        amqp.connect(this.rmqUrl)
            .then(conn => {
                return conn.createChannel();
            }).then(ch => {
                this.ch = ch;
                return MongoClient.connect(this.dbUrl);
            }).then(db => {
                this.db = db;
                return db.collection('Site').findOne({
                    _id: this.siteId,
                    state: 'started'
                });
            }).then(recordedSite => {
                this.baseURI = new uri(recordedSite.baseurl);
                this.ch.assertQueue(this.queue, { durable: true });
                this.ch.prefetch(1);
                this.ch.consume(this.queue, msg => {
                    if (msg !== null)
                        process.call(this, msg);
                });
                this.isRunning = true;
                winston.info(`SiteWorker ${this.workerId}: started`);
            }).catch(err => {
                winston.info(err);
            });
    }

    stop() {
        this.isRunning = false;
    }
}

function process(msg) {
    var content = JSON.parse(msg.content.toString());
    winston.info(`SiteWorker ${this.workerId}: trying processing ${content.url}`);
    this.db.collection(this.pageCollectionName).findOne({
        url: content.url
    }).then(recordedPage => {
        if (recordedPage === null) {
            winston.info(`SiteWorker ${this.workerId}: starting processing ${content.url}`);
            return crawlAndSave.call(this, content.url, content.from);
        } else {
            winston.info(`SiteWorker ${this.workerId}: aborting processing ${content.url} ( already processed)`);
        }
    }).then(() => {
        this.ch.ack(msg);
    }).catch(err => {
        winston.info(err);
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function crawlAndSave(currentURL, contentFrom) {
    var oid = ObjectId();
    var nightmare = new Nightmare({ show: this.show });
    return nightmare.goto(currentURL).wait(2000).screenshot().then(buffer => {
        winston.info(`SiteWorker ${this.workerId}: saving screenshot of ${currentURL}`);
        return this.sftpClient.putBuffer(buffer, `${this.folder}/${oid}.png`);
    }).then(() => {
        return nightmare.evaluate(htmlAnalysis).end();
    }).then(analysisResult => {
        analysisResult.hrefs.forEach(href => {
            if (isHrefValid.call(this, href)) {
                var hrefUri = uri(href).absoluteTo(this.baseURI);
                var msg = JSON.stringify({
                    url: hrefUri.toString(),
                    from: currentURL
                });
                this.ch.sendToQueue(this.queue,
                    new Buffer(msg), { persistent: true }
                );
            }
        });
        var testedPage = {
            _id: oid,
            url: currentURL,
            from: contentFrom,
            body: analysisResult.hash,
            hrefs: analysisResult.hrefs
        };
        this.db.collection(this.pageCollectionName).save(testedPage, null, () => {
            winston.info(`SiteWorker ${this.workerId}: body of ${currentURL} saved`);
        });
    }).catch(err => {
        winston.info(err);
    });
}

function isHrefValid(href) {
    var hrefUri = uri(href);
    if (hrefUri.protocol() != 'http')
        return false;

    hrefUri = hrefUri.absoluteTo(this.baseURI);

    if (hrefUri.hostname() != this.baseURI.hostname())
        return false;

    if (  ! hrefUri.toString().startsWith(this.baseURI.toString())  )
        return false;

    var pathTokens = hrefUri.path().split('.');
    if (pathTokens.length > 1 && pathTokens[pathTokens.length - 1].toLowerCase() != 'html')
        return false;

    return true;
}

module.exports.SiteWorker = SiteWorker;
