// See ../invalid-frame-when-idle.js

var invalidFrameWhenIdleTest = require('./invalid-frame-when-idle');

module.exports = function(socket, log, callback) {
  invalidFrameInIdleTest(socket, log, callback, {
    type: 'PUSH_PROMISE',
    flags: { },
    promised_stream: 4,
    headers: {
      ':method': 'GET',
      ':scheme': 'https',
      ':authority': 'localhost',
      ':path': '/pushed.html'
    }
  });
};
