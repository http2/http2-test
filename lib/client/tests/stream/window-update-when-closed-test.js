// See ../invalid-frame-when-closed.js

var invalidFrameWhenClosedTest = require('./invalid-frame-when-closed');

module.exports = function(socket, log, callback) {
  invalidFrameWhenClosedTest(socket, log, callback, function(stream) {
    return {
      type: 'WINDOW_UPDATE',
      flags: {},
      stream: stream,
      window_size: 10
    };
  },
  'STREAM_CLOSED'
  );
};
