describe('HTTP/2 client', function () {

	var http2 = require('http2-protocol');
	var testBootstrapper = require('../testBootstrapper');
	var tlsSocket;

	var testFunc = function (socket, log, callback, frame) {
		tlsSocket = socket;
		var endpoint = new http2.Endpoint(log, 'SERVER', {});
		socket.pipe(endpoint).pipe(socket);
		var commonError;

		testBootstrapper.withMethodSubstitution(Object.getPrototypeOf(endpoint._serializer).constructor, 'SETTINGS',
			function (frame, buffers) {
				var buffer = new Buffer(1 * 8);
				for (var i = 0; i < 1; i++) {
					//Write settings with undefined ID 13
					buffer.writeUInt32BE(13 & 0xffffff, i * 8);
					buffer.writeUInt32BE(13, i * 8 + 4);
				}

				buffers.push(buffer);
			},
			function (stream) {						
				frame = {
					type : 'SETTINGS',
					flags : {},
					settings : {
						SETTINGS_MAX_CONCURRENT_STREAMS : 100
					}
				};

				frame.stream = 0;

				endpoint._compressor.write(frame);
				
				setTimeout(function () {
				// If there are no exception until this, then we're done
					if (commonError === undefined) {
						console.error('Sent without errors');
						callback();
					} else {
						console.error(commonError);
						callback(commonError);
					}
				}, 2000);
			}
		);

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
