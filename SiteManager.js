const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const winston = require('winston');
const amqp = require('amqplib');

const SiteWorker = require('./SiteWorker.js').SiteWorker;
const CrawlerNode = require('./CrawlerNode.js').CrawlerNode;

class SiteManager extends CrawlerNode {

    constructor(url, numberOfSiteWorkers, serverNames) {
        super(new ObjectId(), serverNames);
        this.url = url;
        this.workers = [];
        this.numberOfSiteWorkers = numberOfSiteWorkers;
        winston.info('SiteManager created');
    }

    start() {
        winston.info(`creating directory ${this.folder}`);
        this.sftpClient.mkdir(this.folder).then(() => {
            return MongoClient.connect(this.dbUrl);
        }).then(db => {
            this.db = db;
            return db.collection('Site').insertOne({
                _id: this.siteId,
                baseurl: this.url,
                state: 'started'
            });
        }).then(() => {
            startWorkers.call(this);
            queueRootURL.call(this);
            winston.info('SiteManager started');
        }).catch(logError);
    }

    stop() {
        this.workers.forEach(worker => {
            winston.info(`worker ${worker.workerId} has been stopped`);
            worker.stop();
        });

        amqp.connect(this.rmqUrl)
            .then(conn => {
                return conn.createChannel();
            }).then(ch => {
                ch.deleteQueue(this.queue);
            }).catch(logError);

        this.db.collection('Site').update({
            _id: this.siteId,
            baseurl: this.url
        },{
            state: 'stopped'
        }).catch(logError);
    }
}

function startWorkers() {
    for (var i = 0; i < this.numberOfSiteWorkers; i++) {
        var show = false;
        var worker = new SiteWorker(this.siteId, this.serverNames, show);
        this.workers.push(worker);
        worker.start();
    }
}

function queueRootURL() {
    amqp.connect(this.rmqUrl)
        .then(conn => {
            return conn.createChannel();
        })
        .then(ch => {
            var msg = {
                url: this.url,
                from: this.url
            };
            ch.assertQueue(this.queue, { durable: true });
            ch.sendToQueue(this.queue, new Buffer(JSON.stringify(msg)), { persistent: true });
        })
        .catch(logError);
}

function logError(err) {
    winston.info(err);
}

module.exports.SiteManager = SiteManager;
