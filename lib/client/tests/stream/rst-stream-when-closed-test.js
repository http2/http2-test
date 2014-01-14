// See ../invalid-frame-when-closed.js

var invalidFrameWhenClosedTest = require('./invalid-frame-when-closed');

module.exports = function(socket, log, callback) {
	invalidFrameWhenClosedTest(socket, log, callback, function(stream) {
		return {
			type: 'RST_STREAM',
			flags: {},
			stream: stream,
			error: 'NO_ERROR'
		};
	});
};