// See ../invalid-frame-when-reserved-remote.js

var invalidFrameWhenReservedRemoteTest = require('./invalid-frame-when-reserved-remote');

module.exports = function(socket, log, callback) {
  invalidFrameWhenReservedRemoteTest(socket, log, callback, function(stream) {
    return {
      type: 'DATA',
      flags: {},
      stream: stream,
      data: new Buffer(10)
    };
  });
};
