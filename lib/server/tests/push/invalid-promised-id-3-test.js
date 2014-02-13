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
// This tests sends a valid ID as promised ID, and then a numerically lower ID as the next promised
// ID. The peer should reset the connection with PROTOCOL_ERROR.

var invalidPromiseIdTest = require('./invalid-promised-id-1-test');

module.exports = function(host, port, log, callback) {
  invalidPromiseIdTest(host, port, log, callback, [9, 7]);
};
