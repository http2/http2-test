// [From the spec](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-6.5):
//
//     SETTINGS frames always apply to a connection, never a single stream.
//     The stream identifier for a settings frame MUST be zero. If an
//     endpoint receives a SETTINGS frame whose stream identifier field is
//     anything other than 0x0, the endpoint MUST respond with a connection
//     error (Section 5.4.1) of type PROTOCOL_ERROR.

var invalidStreamLevelFrameTest = require('./invalid-level-goaway-test.js');

module.exports = function(socket, log, callback) {
  invalidStreamLevelFrameTest(socket, log, callback, {
    type: 'SETTINGS',
    flags: {},
    settings: {
      SETTINGS_MAX_CONCURRENT_STREAMS: 100
    }
  });
};
