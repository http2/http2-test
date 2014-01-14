// See ../invalid-frame-when-closed.js

var invalidFrameWhenClosedTest = require('./invalid-frame-when-closed');

module.exports = function(socket, log, callback) {
  invalidFrameWhenClosedTest(socket, log, callback, function(stream) {
    return {
      type: 'PRIORITY',
      flags: {},
      stream: stream,
      priority: 10
    };
  });
};
