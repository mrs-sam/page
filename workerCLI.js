const argv = require('yargs').usage('$0 slaveCLI.js --master=[string] --show=[string]').argv;
const serverNames = {
    mongoServerName : argv.master || 'localhost',
    rabbitServerName : argv.master || 'localhost',
    fileServerName : argv.master || 'localhost'
};
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const show = argv.show || false;
const SiteWorker = require('./SiteWorker.js').SiteWorker;
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var oid = undefined;
if (argv.oid)
    oid = new ObjectID(argv.oid);

if (!oid) {
    console.log('Active crawlings:');
    MongoClient.connect(`mongodb://${serverNames.mongoServerName}:27017/mrs-sam-page`).then(db => {
        db.collection('Site').find({ state: 'started' }).toArray((err, res) => {
            res.forEach((val, idx) => {
                console.log(`${idx}: ${val._id} (${val.baseurl})`);
            });
            rl.question('Please choose an active crawling: ', answer => {
                oid = res[parseInt(answer)]._id;
                startSiteWorker(oid, serverNames, show);
            });
        });
    });
} else {
    startSiteWorker(oid, serverNames, show);
}

function startSiteWorker(oid, serverNames, show) {
    new SiteWorker(oid, serverNames, show).start();
}
