/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/
var http2 = require('http2-protocol'),
    net = require('net');

module.exports = function(host, port, log, callback) {
  var socket = net.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);

  var scheme = 'https',
      path   = '/server.js';
  var url = require('url').parse( scheme + '://' + host + ':' + port + path);

  // Sending request
  var stream = endpoint.createStream();
  stream.headers({
    ':method': 'GET',
    ':scheme': scheme,
    ':authority': url.hostname,
    ':path': url.path + (url.hash || '')
  });

  stream.on('promise', function(push_stream, req_headers) {
    push_stream.on('end', callback);
    push_stream.on('data', function(fragment) {
      log.trace('Received push bytes: ' + fragment.length);
    });
  });

  stream.on('data', function(fragment) {
    log.trace('Received bytes: ' + fragment.length);
  });

  stream.on('end', callback);

  endpoint.on('peerError', function(error) {
    callback('Inappropriate error code: ' + error);
  });

};
