//Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the BSD 2-Clause License.

var glob = require('glob').sync,
	expect = require('chai').expect,
	bunyan = require('bunyan'),
	path = require('path'),
	tls = require('tls'),
	fs = require('fs'),
	http2Protocol = require('http2-protocol'),
	net = require('net');

var Browser = require('./browser');

var implementedVersion = 'HTTP-draft-07/2.0';

describe('HTTP/2 client', function() {


	var tests = glob(__dirname + '/tests/**/*-test.js'),
		port = 3024,
		testServer, log, browser;

	function createLogger(name) {
		return bunyan.createLogger({
			name: name,
			streams: [{
				level: 'debug',
				path: __dirname + '/../../test.log'
			}],
			serializers: http2Protocol.serializers,
			level: 'info'
		});
	}
	log = createLogger('test');
	beforeEach(function() {
		// Load the TCP Library


		// Keep track of the chat clients
		var clients = [];

		// Start a TCP Server
		testServer = net.createServer();
		testServer.listen(port);
		browser = new Browser(process.env.HTTP2_BROWSER);
	});

	tests.forEach(function(file) {
		it(file, function(done) {

			testServer.on('connection', function(socket) {
				testServer.close();
				var startTest = require(file);
				startTest(socket, log, function(error) {
					done(error);
					socket.destroy();
				});
			});

			browser.start('http://localhost:' + port);
		});
	});

	afterEach(function() {
		browser.stop();
	});

});