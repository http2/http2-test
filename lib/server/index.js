/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/

var glob = require('glob').sync,
	expect = require('chai').expect,
	bunyan = require('bunyan'),
	path = require('path'),
	tls = require('tls'),
	fs = require('fs'),
	http2 = require('http2-protocol');

var implementedVersion = 'HTTP-draft-09/2.0';
var Server = require('./server');

describe('HTTP/2 server', function() {
	var tests = glob(__dirname + '/tests/**/*-test.js'),
		hostname = 'localhost',
		port = 8080,
		testClient, log, server;

	function createLogger(name) {
		return bunyan.createLogger({
			name: name,
			streams: [{
				level: 'debug',
				path: __dirname + '/../../test.log'
			}],
			serializers: http2.serializers,
			level: 'info'
		});
	}
	log = createLogger('ServerTest');

	beforeEach(function(done) {
		server = new Server(port, log);
                server.start(done);
                log.info('Server started');
	});

	tests.forEach(function(file) {
		it(file, function(done) {
                        var startTest = require(file);
                          startTest(hostname, port, log, function(error) {
                          done(error);
                        });
		});
	});

	afterEach(function() {
          server.stop();
	});
});
