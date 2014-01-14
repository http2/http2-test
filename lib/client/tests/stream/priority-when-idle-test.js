// See ../invalid-frame-when-idle.js

var invalidFrameWhenIdleTest = require('./invalid-frame-when-idle');

module.exports = function(socket, log, callback) {
  invalidFrameWhenIdleTest(socket, log, callback, {
    type: 'PRIORITY',
    flags: {},
    priority: 10
  });
};
