// See ../invalid-frame-when-idle.js

var invalidFrameWhenIdleTest = require('./invalid-frame-when-idle');

module.exports = function(host, port, log, callback) {
  invalidFrameWhenIdleTest(host, port, log, callback, {
    type: 'PRIORITY',
    flags: {},
    priority: 10
  });
};
