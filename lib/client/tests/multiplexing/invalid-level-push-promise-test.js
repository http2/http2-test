// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.6):
//
//     ... If the stream identifier field specifies the value
//     0x0, a recipient MUST respond with a connection error (Section 5.4.1)
//     of type PROTOCOL_ERROR.

var invalidConnectionLevelFrameTest = require('./invalid-level-data-test.js');

module.exports = function(socket, log, callback) {
  invalidConnectionLevelFrameTest(socket, log, callback, {
    type: 'PUSH_PROMISE',
    flags: {},
    headers: {
      ':method': 'GET',
      ':scheme': 'https',
      ':host': 'localhost',
      ':path': '/pushed.html'
    },
    promised_stream: 12
  });
};
