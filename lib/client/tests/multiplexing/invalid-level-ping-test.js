// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.7):
//
//     PING frames are not associated with any individual stream. If a PING
//     frame is received with a stream identifier field value other than
//     0x0, the recipient MUST respond with a connection error
//     (Section 5.4.1) of type PROTOCOL_ERROR.

var invalidStreamLevelFrameTest = require('./invalid-level-goaway-test.js');

module.exports = function(socket, log, callback) {
  invalidStreamLevelFrameTest(socket, log, callback, {
    type: 'PING',
    flags: {},
    data: new Buffer(8)
  });
};
