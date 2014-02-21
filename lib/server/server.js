/*
The MIT License
 
Copyright (C) 2014, Akamai Technologies
 
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*
The MIT License
 
Copyright (C) 2013 Gábor Molnár <gabor@molnar.es>
 
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var fs = require('fs');
var path = require('path');
var http2 = require('http2');

var server, port, log;

function Server(port, log) {
  var options = { plain:true };
  this.port = port;
  this.log = log;

  // Passing bunyan logger (optional)
  options.log = require('bunyan').createLogger({
      name: 'server',
      level: 'debug',
      serializers: http2.serializers
  });

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // We cache one file to be able to do simple performance tests without waiting for the disk
  var cachedFile = fs.readFileSync(path.join(__dirname, 'server.js'));
  var cachedUrl = '/server.js';

  // Creating the server
  this.server = http2.createServer(options, function(request, response) {
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

Server.prototype.start = function(done) {
  this.server.listen(port || 8800);
  this.log.debug('Server started');
  done();
};

Server.prototype.stop = function(callback) {
  this.server.close();
};

module.exports = Server;
