// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.7):
//
//     DATA frames MUST be associated with a stream. If a DATA frame is
//     received whose stream identifier field is 0x0, the recipient MUST
//     respond with a connection error (Section 5.4.1) of type
//     PROTOCOL_ERROR.

var http2 = require('http2-protocol');
module.exports = function(socket, log, callback, frame) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {});
  socket.pipe(endpoint).pipe(socket);

  setImmediate(function() {
    frame = frame || {
      type: 'DATA',
      flags: {},
      data: new Buffer(10)
    };

    frame.stream = 0;

    log.debug('Sending connection-level ' + frame.type + ' frame');

    endpoint._compressor.write(frame);
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
