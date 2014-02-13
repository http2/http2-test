var http2 = require('http2-protocol');
    net = require('net');

module.exports = function(host, port, log, callback, compressedData) {
  var socket = net.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {}, {
    beforeSerialization: beforeSerialization
  });
  socket.pipe(endpoint).pipe(socket);

  endpoint.on('stream', function(stream) {
    stream.headers({
      ':status': 200
    });
    stream.end('response body');
  });

  var scheme = 'https',
      path   = '/server.js';
  var url = require('url').parse( scheme + '://' + host + ':' + port + path);

  var stream = endpoint.createStream();
  stream.headers({
    ':method': 'GET',
    ':scheme': scheme,
    ':authority': url.hostname,
    ':path': url.path + (url.hash || '')
  });


  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.data = compressedData;
    }
    forward(frame);
    done();
  }

  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'PROTOCOL_ERROR') {
      callback();
    } else {
      callback('Inappropriate error code: ' + error);
    }
  });
};
