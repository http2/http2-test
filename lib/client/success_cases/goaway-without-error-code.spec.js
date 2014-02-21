describe('HTTP/2 client', function () {

	var http2 = require('http2-protocol');
	var testBootstrapper = require('../testBootstrapper');
	var tlsSocket;

	var testFunc = function (socket, log, callback, frame) {
		tlsSocket = socket;
		var endpoint = new http2.Endpoint(log, 'SERVER', {});
		socket.pipe(endpoint).pipe(socket);
		var commonError;

		endpoint.on('stream', function (stream) {
			frame = frame || {
				type : 'GOAWAY',
				flags : {},
				last_stream : 1
			};

			frame.stream = 0;
			
			testBootstrapper.withMethodSubstitution(Object.getPrototypeOf(endpoint._serializer).constructor, 'GOAWAY',
				function (frame, buffers) {
					var buffer = new Buffer(8);
					var last_stream = frame.last_stream;
					buffer.writeUInt32BE(last_stream, 0);
					buffers.push(buffer);
				},
				function () {
					endpoint._compressor.write(frame);
				}
			);
		

			setTimeout(function () {
				// If there are no exception until this, then we're done
				if (commonError === undefined) {
					callback();
				} else {
					console.error(commonError);
					callback(commonError);
				}
			}, 2000);
		});

		endpoint._connection.on('peerError', function (error) {
			commonError = error;
		});
		
	};

	it(__filename, function (done) {
		testBootstrapper(testFunc, function (error) {
			done(error);
		});
	});
	
});
