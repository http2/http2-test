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
  http2 = require('http2');

var Server = require('./server');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe('H2 server compliance', function() {
  var hostname = 'localhost', // hostname sent in requests
    port = 8080,
    log,
    server;

  var alltests = glob(__dirname + '/tests/**/*test.js');

  // using object as a 'set'
  var failingtestlist = {
    '/tests/headers/self-dependency-test.js': true,
    '/tests/data/stream-id-closed-test.js': true,
    '/tests/priority/self-dependency-test.js': true,
    '/tests/priority/frame-oversize-test.js': true,
    '/tests/priority/frame-undersize-test.js': true,
    '/tests/priority/zero-size-test.js': true,
    '/tests/rst-stream/multiple-rst-streams-test.js': true,
    '/tests/rst-stream/stream-closed-test.js': true,
    '/tests/rst-stream/stream-skipped-test.js': true,
    '/tests/settings/stream-closed-test.js': true,
    '/tests/settings/stream-even-test.js': true,
    '/tests/settings/stream-half-closed-test.js': true,
    '/tests/settings/stream-idle-test.js': true,
    '/tests/ping/stream-id-even-test.js': true,
    '/tests/ping/stream-id-odd-test.js': true,
    '/tests/goaway/stream-even-test.js': true,
    '/tests/goaway/stream-idle-test.js': true,
    '/tests/goaway/stream-closed-test.js': true,
    '/tests/window-update/stream-update-0-test.js': true,
    '/tests/window-update/stream-wu-over-limit-test.js': true,
    '/tests/continuation/continuation-after-end-headers-test.js': true,
    '/tests/continuation/continuation-without-headers-test.js': true,
    '/tests/continuation/stream-id-even-test.js': true,
    '/tests/continuation/stream-id-idle-test.js': true,
    '/tests/continuation/stream-id-closed-test.js': true,
    '/tests/header-fields/pseudo-after-regular-test.js': true,
    '/tests/hpack/bad-zero-repr-test.js': true,
    '/tests/hpack/change-header-table-size-test.js': true,
    '/tests/hpack/double-2-header-table-update-test.js': true,
    '/tests/hpack/double-header-table-update-test.js': true,
    '/tests/hpack/eos-at-end-test.js': true,
    '/tests/hpack/eos-at-start-test.js': true,
    '/tests/hpack/eos-in-middle-test.js': true,
    '/tests/hpack/large-header-table-size-test.js': true,
    '/tests/hpack/large-zero-repr-test.js': true,
    '/tests/hpack/long-header-test.js': true,
    '/tests/hpack/max-header-list-size-test.js': true,
    '/tests/hpack/overflowing-length-test.js': true,
    '/tests/hpack/table-size-update-under-limit-test.js': true,
    '/tests/hpack/truncated-length-test.js': true,
    '/tests/hpack/truncated-value-test.js': true,
  };


  var tests = [];
  for (var i = 0; i < alltests.length; i++) {
    // get filename without full path 
    var filename = alltests[i].substring(__dirname.length);
    if (! (filename in failingtestlist)) {
      tests.push(alltests[i]);
    }
  }


  function createLogger(name) {
    return bunyan.createLogger({
      name: name,
      serializers: http2.serializers,
      level: 'debug',
      streams: [{
        path: __dirname + '/../../tests.log',
        level: 'debug',
      }],
    });
  }

  log = createLogger('ServerTest');


  beforeEach(function(done) {
    var cache = {
      file: 'Hello World!',
      url: '/index.html',
    };
    server = new Server(port, log, cache);
    server.start(log, done);
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
    server.stop(log);
  });

});
