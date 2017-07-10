var request = require('request-promise-native');
const MongoClient = require('mongodb').MongoClient;

describe('start crawl', function() {

    it('should accept connexion and crawl a site', function(done) {
        var options = {
            method: 'POST',
            uri: 'http://localhost:8080/site',
            body: {
                url: 'http://localhost:8080',
                numberOfSiteWorkers: 1
            },
            resolveWithFullResponse: true,
            json: true

        };

        request.post(options)
            .then(_parsedBody => {
                done();
            })
            .catch(err => {
                done(err);
            });

    });

    it('should see one active manager', function(done) {
        var options = {
            method: 'GET',
            uri: 'http://localhost:8080/site',
            json: true

        };

        setTimeout(
            () => {
                request.get(options)
                    .then(parsedBody => {
                        var managersIds = parsedBody;
                        if (managersIds.length === 1) {
                            done();
                        } else {
                            done(`there is ${managersIds.length} managers which is less or more than 1 manager`);
                        }
                    })
                    .catch(err => {
                        done(err);
                    });
            }, 1000);
    });

    it('should see 5 pages', function(done) {
        this.timeout(40000);

        var options = {
            method: 'POST',
            uri: 'http://localhost:8080/site',
            body: {
                url: 'http://localhost:8080/test-site/',
                numberOfSiteWorkers: 3
            },
            json: true

        };

        request.post(options)
            .then(parsedBody => {
                var len = parsedBody.length;
                var siteId = parsedBody.toString().slice(len - 24, len);
                return siteId;
            })
            .then(siteId => {
                setTimeout(
                    () => {

                        MongoClient.connect('mongodb://localhost:27017/mrs-sam-page')
                            .then(db => {
                                return db.collection(`Pages_${siteId}`).count();
                            })
                            .then(nb => {
                                if (nb === 5) {
                                    done();
                                } else {
                                    done(`${nb} pages, should be 5.`);
                                }
                            })
                            .catch(err => {
                                done(err);
                            });
                    }, 35000);
            })
            .catch(err => {
                done(err);
            });
    });

});
