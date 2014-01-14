// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.2):
//
//     HEADERS frames MUST be associated with a stream.  If a HEADERS frame
//     is received whose stream identifier field is 0x0, the recipient MUST
//     respond with a connection error (Section 5.4.1) of type
//     PROTOCOL_ERROR.

var invalidConnectionLevelFrameTest = require('./invalid-level-data-test.js');

module.exports = function(socket, log, callback) {
  invalidConnectionLevelFrameTest(socket, log, callback, {
    type: 'HEADERS',
    flags: {},
    headers: {
      ':status': 200
    }
  });
};
