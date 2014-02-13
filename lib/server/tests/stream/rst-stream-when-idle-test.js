// See ../invalid-frame-when-idle.js

var invalidFrameWhenIdleTest = require('./invalid-frame-when-idle');

module.exports = function(host, port, log, callback) {
  invalidFrameWhenIdleTest(host, port, log, callback, {
    type: 'RST_STREAM',
    flags: {},
    error: 'NO_ERROR'
  });
};
