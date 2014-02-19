#!/usr/bin/env node

//Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the BSD 2-Clause License.


var fs = require('fs');
var path = require('path');
var http2 = require('http2');
var http2Protocol = require('http2-protocol');
var net = require('net');
var log = require('bunyan').createLogger({
  name: 'Browser',
  level: 'error',
  serializers: http2.serializers
});

http2.globalAgent = new http2.Agent({
  log: log
});

var options = require('url').parse(process.argv.pop());
options.plain = true;
var key = [ !! options.plain,
  options.host
].join(':');

var endpoint = new http2Protocol.Endpoint(log, 'CLIENT');
endpoint.socket = net.connect({
  port: options.port,
  host: 'localhost'
});
endpoint.pipe(endpoint.socket).pipe(endpoint);
endpoint.on('error', function(error) {});

http2.globalAgent.endpoints[key] = endpoint;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Sending the request


var request = http2.request(options);
request.end();

// Receiving the response
request.on('response', function(response) {
  //response.pipe(process.stdout);
  response.on('end', finish);
});

// Receiving push streams
request.on('push', function(pushRequest) {
  var filename = path.join(__dirname, '/push-' + push_count);
  push_count += 1;
  console.error('Receiving pushed resource: ' + pushRequest.url + ' -> ' + filename);
  pushRequest.on('response', function(pushResponse) {
    pushResponse.pipe(fs.createWriteStream(filename)).on('finish', finish);
  });
});

// Quitting after both the response and the associated pushed resources have arrived
var push_count = 0;
var finished = 0;

function finish() {
  finished += 1;
  if (finished === (1 + push_count)) {
    process.exit();
  }
}