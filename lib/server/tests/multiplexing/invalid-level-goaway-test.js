// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.8):
//
//     The GOAWAY frame applies to the connection, not a specific stream.
//     The stream identifier MUST be zero.

var http2 = require('http2-protocol'),
    net   = require('net');

module.exports = function(host, port, log, callback, frame) {
  var socket = net.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);

  var scheme = 'https',
      path   = '/server.js';
  var url = require('url').parse( scheme + '://' + host + ':' + port + path);

  var stream = endpoint.createStream();
  stream.headers({
    ':method': 'GET',
    ':scheme': scheme,
    ':path': url.path + (url.hash || '')
  });

  setImmediate(function() {
    frame = frame || {
      type: 'GOAWAY',
      flags: {},
      last_stream: 1,
      error: 'NO_ERROR'
    };
    frame.stream = 1; // stream.id is undefined at this point

    log.debug('Sending stream-level ' + frame.type + ' frame');
    endpoint._compressor.write(frame);
  });


  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'PROTOCOL_ERROR') {
      callback();
    } else {
      callback('Inappropriate error code: ' + error);
    }
  });
};
