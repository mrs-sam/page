const ObjectId = require('mongodb').ObjectID;
const SiteManager = require('../SiteManager.js').SiteManager;
const winston = require('winston');
const MongoClient = require('mongodb').MongoClient;

module.exports.init = function(serverNames, webServer) {
    var runningManagers = [];
    webServer.post('/site', function(req, res) {
        var options = req.body;
        var url = options.url;
        var numberOfSiteWorkers = options.numberOfSiteWorkers || 0;
        var manager = new SiteManager(url, numberOfSiteWorkers, serverNames);
        manager.start();
        runningManagers.push(manager);
        res.send(`Test request has been received, the ID is ${manager.siteId}`);
        res.status(200).end();
    }).post('/site/:id', function(req, res) {
        console.log(`stop ${req.params.id}`);
        var oid = new ObjectId(req.params.id);
        var manager = runningManagers.find( manager => {
            return manager.siteId.equals(oid);
        });
        if (manager) {
            manager.stop();
        } else {
            winston.info(`no running manager found with siteId ${oid}, cleaning database`);
            MongoClient.connect(`mongodb://${serverNames.mongoServerName}:27017/mrs-sam-page`).then( db => {
                db.collection('Site').update({
                    _id: oid
                },{
                    state: 'stopped'
                });
            });
        }
        res.status(200).end();
    });
};
