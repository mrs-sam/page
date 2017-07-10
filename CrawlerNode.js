const SftpClient = require('sftp-promises');

class CrawlerNode {

    constructor(siteId, serverNames) {
        this.siteId = siteId;
        this.serverNames = serverNames;
        this.sftpClient = new SftpClient({
            host : `${serverNames.fileServerName}`,
            port : '2222',
            username : 'mrssam',
            password : 'mrssam'
        });
        this.dbUrl = `mongodb://${serverNames.mongoServerName}:27017/mrs-sam-page`;
        this.rmqUrl = `amqp://${serverNames.rabbitServerName}`;
        this.queue = `urlOf${this.siteId}`;
        this.folder = `upload/${this.siteId}`;
    }

}

module.exports.CrawlerNode = CrawlerNode;
