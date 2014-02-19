//Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the BSD 2-Clause License.

/* 
This is a test template. 
The top part of the file should explain what is being tested

Template based on http://github.com/molnarg/http2-testpage
*/

var http2 = require('http2-protocol');

// The module.exports is required. 
module.exports = function(socket, log, callback) {
	var endpoint = new http2.Endpoint(log, 'SERVER', {});
	var MAX_HTTP_PAYLOAD_SIZE = 10;
	socket.pipe(endpoint).pipe(socket);

	endpoint.on('stream', function(stream) {
		endpoint._compressor.write({
			type: 'HEADERS',
			flags: {},
			stream: stream.id,
			headers: {
				':status': 200
			}
		});

		endpoint._serializer._sizeLimit = Infinity;
		endpoint._serializer.write({
			type: 'DATA',
			flags: {},
			stream: stream.id,
			data: new Buffer('')
		});
		endpoint.close();

		// TODO - Fix this - call the callback when the response has been sent
		setTimeout(function() {
			callback();
		}, 0);
	});

	endpoint.on('peerError', function(error) {
		callback(false);
	});
};