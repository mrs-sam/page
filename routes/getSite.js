const MongoClient = require('mongodb').MongoClient;
const winston = require('winston');

module.exports.init = function(serverNames, webServer) {
    var dbUrl = `mongodb://${serverNames.mongoServerName}:27017/mrs-sam-page`;
    webServer.get('/site', (req, res) => {
        MongoClient.connect(dbUrl).then(db => {
            db.collection('Site', function(err, siteCollection) {
                if (err) {
                    res.send(err).status(404).end();
                } else {
                    siteCollection.find().toArray().then(sitesArray => {
                        res.send(sitesArray).status(200).end();
                    }).catch(err => {
                        res.send(err).status(500).end();
                    });
                }
            });
            db.close();
        }).catch(err => {
            winston.info(err);
            res.send(err).status(500).end;
        });
    }).get('/site/:id', function(req, res) { //req.params.id
        MongoClient.connect(dbUrl).then(db => {
            db.collection(`Pages_${req.params.id}`).count().then(nb => {
                var msg = {
                    numberOfPages : nb
                };
                res.send(JSON.stringify([ msg ])).status(200).end();
            }).catch(err => {
                res.send(err).status(500).end();
            });
            db.close();
        }).catch(err => {
            res.send(err).status(500).end();
        });
    });
};
