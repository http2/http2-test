describe('HTTP/2 client', function () {

	var http2 = require('http2-protocol');
	var testBootstrapper = require('../testBootstrapper');
	var tlsSocket;

	var testFunc = function (socket, log, callback, frame, desiredError) {
		tlsSocket = socket;
		var endpoint = new http2.Endpoint(log, 'SERVER', {});
		socket.pipe(endpoint).pipe(socket);
		var commonError;
		
		endpoint.on('stream', function (stream) {
			endpoint._compressor.write({
				type : 'HEADERS',
				stream : stream.id,
				headers : {
					':status' : 200
				}
			});

			console.error("HEADERS SENT");
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
