// > [5.1.1. Stream Identifiers](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-5.1.1)
// >
// > Streams are identified with an unsigned 31-bit integer. Streams
// > initiated by a client MUST use odd-numbered stream identifiers; those
// > initiated by the server MUST use even-numbered stream identifiers. A
// > stream identifier of zero (0x0) is used for connection control
// > message; the stream identifier zero MUST NOT be used to establish a
// > new stream.
// >
// > ...
// >
// > [6.6. PUSH_PROMISE](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.6)
// >
// > ... a receiver MUST
// > treat the receipt of a PUSH_PROMISE that promises an illegal stream
// > identifier (Section 5.1.1) (that is, an identifier for a stream that
// > is not currently in the "idle" state) as a connection error
// > (Section 5.4.1) of type PROTOCOL_ERROR, unless the receiver recently
// > sent a RST_STREAM frame to cancel the associated stream (see
// > Section 5.1).
//
// This tests sends 0 as promised stream ID. The peer should reset the connection with
// PROTOCOL_ERROR.

var http2 = require('http2-protocol');

module.exports = function(socket, log, callback, ids) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {}, { beforeCompression: beforeCompression });
  socket.pipe(endpoint).pipe(socket);

  ids = ids || [0];

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'PUSH_PROMISE') {
      frame.promised_stream = ids.shift();
    }
    forward(frame);
    done();
  }

  endpoint.on('stream', function(stream) {
    stream.headers({
      ':status': 200
    });
    ids.forEach(function() {
      stream.promise({
        ':method': 'GET',
        ':scheme': 'https',
        ':authority': 'localhost',
        ':path': 'promised-resource-' + Math.round(Math.random() * 1000),
      });
    });
  });

  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'PROTOCOL_ERROR') {
      callback();
    } else {
      callback('Not appropriate error code: ' + error);
    }
  });
};
