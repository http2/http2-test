// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the BSD 2-Clause License.

// See ../invalid-frame-when-reserved-remote.js

var invalidFrameWhenReservedRemoteTest = require('./invalid-frame-when-reserved-remote');

module.exports = function(socket, log, callback) {
	invalidFrameWhenReservedRemoteTest(socket, log, callback, function(stream) {
		return {
			type: 'WINDOW_UPDATE',
			flags: {},
			window_size: 2,
			stream: 2
		};
	});
};