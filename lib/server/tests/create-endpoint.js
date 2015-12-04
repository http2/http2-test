/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/


var http2 = require('http2').protocol,
    tls = require('tls'),
    path = require('path'),
    assert = require('chai').assert;

module.exports = function(host, port, log, callback, endpointOptions) {

  endpointOptions = endpointOptions || {};
  endpointOptions.eventHandlers = endpointOptions.eventHandlers || {};
  endpointOptions.settings = endpointOptions.settings || {};
  endpointOptions.filters = endpointOptions.filters || {};
  endpointOptions.preface = endpointOptions.preface;

  var defaultStreamEndHandler = callback;

  function defaultStreamErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
    if (typeof error !== 'undefined') {
      callback();
    }
  }

  function defaultEndpointErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in endpoint: ' + error);
    if (typeof error !== 'undefined') {
      callback();
    }
  }

  function defaultEndpointPeerErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error at peer: ' + error);
    if (typeof error !== 'undefined') {
      callback();
    }
  }

  function defaultSocketErrorHandler(error) { // needs to defined in the test or throws an error
    assert.isUndefined(error, 'Unhandled socket error: ' + error);
  }

  function defaultSocketEndHandler() { // needs to overridden in the test or throws an error
    assert(0, 'Socket closed event was not handled');
  }

  endpointOptions.eventHandlers.streamEndHandler = endpointOptions.eventHandlers.streamEndHandler || defaultStreamEndHandler;
  endpointOptions.eventHandlers.streamErrorHandler = endpointOptions.eventHandlers.streamErrorHandler || defaultStreamErrorHandler;
  endpointOptions.eventHandlers.endpointErrorHandler = endpointOptions.eventHandlers.endpointErrorHandler || defaultEndpointErrorHandler;
  endpointOptions.eventHandlers.endpointPeerErrorHandler = endpointOptions.eventHandlers.endpointPeerErrorHandler || defaultEndpointPeerErrorHandler;
  endpointOptions.eventHandlers.socketEndHandler = endpointOptions.eventHandlers.socketEndHandler || defaultSocketEndHandler;
  endpointOptions.eventHandlers.socketErrorHandler = endpointOptions.eventHandlers.socketErrorHandler || defaultSocketErrorHandler;

  var socketOptions = {
    host: 'localhost',
    port: port,
    rejectUnauthorized: false,
    servername: host,
    NPNProtocols: ['h2'],
  };

  var socket = tls.connect(socketOptions);

  this.endpoint = new http2.Endpoint(log, 'CLIENT', endpointOptions.settings, endpointOptions.filters, endpointOptions.preface);
  socket.pipe(this.endpoint).pipe(socket);

  var scheme = 'https',
      path   = '/index.html';
  var url = require('url').parse(scheme + '://' + host + ':' + port + path);

  var stream = this.endpoint.createStream();

  socket.on('error', endpointOptions.eventHandlers.socketErrorHandler);
  socket.on('end', endpointOptions.eventHandlers.socketEndHandler);

  stream.on('end', endpointOptions.eventHandlers.streamEndHandler);
  stream.on('error', endpointOptions.eventHandlers.streamErrorHandler);
  this.endpoint.on('error', endpointOptions.eventHandlers.endpointErrorHandler);
  this.endpoint.on('peerError', endpointOptions.eventHandlers.endpointPeerErrorHandler);

  stream.headers({
    ':method': 'GET',
    ':scheme': scheme,
    ':authority': url.hostname,
    ':path': url.path + (url.hash || '')
  });

  stream.resume(); // need this for 'end' event to fire without read()s
  stream.end(); // need this so framework will set the 'END_STREAM' flag

  return this.endpoint;
};

