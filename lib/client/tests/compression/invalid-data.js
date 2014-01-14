var http2 = require('http2-protocol');

module.exports = function(socket, log, callback, compressedData) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {}, {
    beforeSerialization: beforeSerialization
  });
  socket.pipe(endpoint).pipe(socket);

  endpoint.on('stream', function(stream) {
    stream.headers({
      ':status': 200
    });
    stream.end('response body');
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
      callback('Not appropriate error code: ' + error);
    }
  });
};