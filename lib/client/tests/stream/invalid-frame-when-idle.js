// > [5.1. Stream States](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-5.1)
// >
// > ...
// >
// > All streams start in the **idle** state. In this state, no frames have been exchanged.
// >
// > * Sending or receiving a HEADERS frame causes the stream to become "open".
// >
// > * Sending a PUSH_PROMISE frame marks the associated stream for later use.  The stream state
// >   for the reserved stream transitions to "reserved (local)".
// >
// > * Receiving a PUSH_PROMISE frame marks the associated stream as reserved by the remote peer.
// >   The state of the stream becomes "reserved (remote)".
// >
// > ...
// >
// > In the absence of more specific guidance elsewhere in this document, implementations SHOULD
// > treat the receipt of a message that is not expressly permitted in the description of a state
// > as a connection error (Section 5.4.1) of type PROTOCOL_ERROR.

var http2 = require('http2-protocol');

module.exports = function(socket, log, callback, frame) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {});
  socket.pipe(endpoint).pipe(socket);

  setImmediate(function() {
    frame.stream = 2;
    endpoint._compressor.write(frame);
  });

  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'PROTOCOL_ERROR' || 'FLOW_CONTROL_ERROR') {
      callback();
    } else {
      callback('Not appropriate error code: ' + error);
    }
  });
};