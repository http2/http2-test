// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.7):
//
//     DATA frames MUST be associated with a stream. If a DATA frame is
//     received whose stream identifier field is 0x0, the recipient MUST
//     respond with a connection error (Section 5.4.1) of type
//     PROTOCOL_ERROR.

var http2 = require('http2-protocol');
module.exports = function(socket, log, callback, frame, desiredError) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {});
  socket.pipe(endpoint).pipe(socket);

  endpoint.on('stream', function(stream) {
    endpoint._compressor.write({
      type: 'HEADERS',
      flags: {},
      stream: stream.id,
      headers: {
        ':status': 200
      }
    });

    log.debug('Sending oversized DATA frame');

    endpoint._serializer._sizeLimit = Infinity;
    endpoint._serializer.write({
      type: 'DATA',
      flags: {},
      stream: stream.id,
      data: new Buffer(16389)
    });
  });

  endpoint._connection.on('peerError', function(error) {
    if (error === 'FRAME_SIZE_ERROR') {
      callback();
    } else {
      callback('Not appropriate error code: ' + error);
    }
  });
};