// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.7):
//
//     In addition to the frame header, PING frames MUST contain 8 octets of
//     data in the payload. A sender can include any value it chooses and
//     use those bytes in any fashion.
//
//     ...
//
//     Receipt of a PING frame with a length field value other than 8 MUST
//     be treated as a connection error (Section 5.4.1) of type
//     PROTOCOL_ERROR.

var http2 = require('http2-protocol');

module.exports = function(socket, log, callback) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {});
  socket.pipe(endpoint).pipe(socket);

  setImmediate(function() {
    // After sending the connection header:
    log.debug('Sending oversize PING frame');
    endpoint._serializer.write({
      type: 'PING',
      flags: {},
      stream: 0,
      data: new Buffer(10)
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
