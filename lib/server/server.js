var fs = require('fs');
var path = require('path');
var http2 = require('http2');

var server, port, log;

function Server(port, log, cache) {
  var options = {
    cert: fs.readFileSync(path.join(__dirname, '/../res/keys/localhost.crt')),
    key: fs.readFileSync(path.join(__dirname, '/../res/keys/localhost.key')),
    //ciphers: 'ECDHE-RSA-AES128-GCM-SHA256',
  };
  this.port = port;
  this.log = log;

  // Passing bunyan logger (optional)
  options.log = require('bunyan').createLogger({
      name: 'localserver',
      level: 'trace',
      serializers: http2.serializers,
      streams: [{
        path: __dirname + '/../../localserver.log',
        level: 'trace',
      }],
  });

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // We cache one file to be able to do simple performance tests without waiting for the disk
  var cachedFile = cache.file;
  var cachedUrl = cache.url;

  // Creating the server
  this.server = http2.createServer(options, function(request, response) {
    if (request.url instanceof Array) {
      request.url = request.url[0];
    }
    var filename = path.join(__dirname, request.url || '/server.js');

    // Serving server.js from cache. Useful for microbenchmarks.
    if (request.url === cachedUrl) {
      response.end(cachedFile);
    }

    // Reading file from disk if it exists and is safe.
    else if ((filename.indexOf(__dirname) === 0) && fs.existsSync(filename) && fs.statSync(filename).isFile()) {
      response.writeHead('200');

      // If they download the certificate, push the private key too, they might need it.
      if (response.push && request.url === '../res/keys/localhost.crt') {
        var push = response.push('../res/keys/localhost.key');
        push.writeHead(200);
        fs.createReadStream(path.join(__dirname, '../res/keys/localhost.key')).pipe(push);
      }

      fs.createReadStream(filename).pipe(response);
    }

    // Otherwise responding with 404.
    else {
      response.writeHead('404');
      response.end();
    }
  });
}

Server.prototype.start = function(log, done) {
  this.server.listen(this.port || 8080);
  log.info('Server started');
  done();
};

Server.prototype.stop = function(log) {
  this.server.close();
  log.info('Server stopped');
};

module.exports = Server;
