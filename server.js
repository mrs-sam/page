var argv = require('yargs').usage('$0 server.js --mongo=[string] --rabbit=[string] --sftp=[string]').argv;
var serverNames = {
    mongoServerName : argv.mongo || 'localhost',
    rabbitServerName : argv.rabbit || 'localhost',
    fileServerName : argv.sftp || 'localhost'
};

var winston = require('winston');

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var applicationRoot = __dirname;
var app = express();

//files for HTML pages
app.use(express.static(path.join(applicationRoot, './webApp')));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

var fs = require('fs');
var RouteDir = 'routes';
var files = fs.readdirSync(RouteDir);

files.forEach(function(file) {
    var filePath = path.resolve('./', RouteDir, file);
    var route = require(filePath);
    route.init(serverNames, app);
});

app.listen(8080, function() {
    winston.info('Mrs-Sam listening on port 8080');
});
