// See ../invalid-frame-when-closed.js

var invalidFrameWhenClosedTest = require('./invalid-frame-when-closed');

module.exports = function(socket, log, callback) {
  invalidFrameWhenClosedTest(socket, log, callback, function(stream) {
    return {
      type: 'PUSH_PROMISE',
      flags: {},
      stream: stream,
      promised_stream: 4,
      headers: {
        ':method': 'GET',
        ':scheme': 'http',
        ':authority': 'localhost',
        ':path': '/pushed.html'
      }
    };
  });
};
