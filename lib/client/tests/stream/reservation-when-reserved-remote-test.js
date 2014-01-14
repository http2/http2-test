// > [6.6. PUSH_PROMISE](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.6)
// >
// > ...
// >
// > Similarly, a receiver MUST treat the receipt of a PUSH_PROMISE that promises an illegal stream
// > identifier (Section 5.1.1) (that is, an identifier for a stream that is not currently in the
// > "idle" state) as a connection error (Section 5.4.1) of type PROTOCOL_ERROR, unless the receiver
// > recently sent a RST_STREAM frame to cancel the associated stream (see Section 5.1).
//
// This test promises a stream that is in the 'reserved (remote)' state already.

var invalidFrameWhenReservedRemoteTest = require('./invalid-frame-when-reserved-remote');

module.exports = function(socket, log, callback) {
  invalidFrameWhenReservedRemoteTest(socket, log, callback, function(reservedStream, mainStream) {
    return {
      type: 'PUSH_PROMISE',
      flags: {},
      stream: mainStream,
      promised_stream: reservedStream,
      headers: {
        ':method': 'GET',
        ':scheme': 'https',
        ':authority': 'localhost',
        ':path': 'promised-resource-2'
      }
    };
  });
};
