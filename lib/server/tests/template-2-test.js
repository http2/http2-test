/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/


var http2 = require('http2').protocol,
    tls = require('tls'),
    fs = require('fs'),
    path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = function(host, port, log, callback) {

  var options = {
    host: 'localhost',
    port: port,
    rejectUnauthorized: false,
    NPNProtocols: ['h2'],
    //ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
  };

  var socket = tls.connect(options, socketConnected);

  var endpoint = new http2.Endpoint(log, 'CLIENT');
  socket.pipe(endpoint).pipe(socket);

  var scheme = 'https',
      path   = '/index.html';
  var url = require('url').parse( scheme + '://' + host + ':' + port + path);

  var stream;
  function socketConnected() {
    stream = endpoint.createStream();
    headerOptions = {
      ':method': 'GET',
      ':scheme': scheme,
      ':authority': url.host,
      ':path': url.path,
    };
    stream.headers(headerOptions);
    stream.resume(); // need this for 'end' event to fire
    stream.on('end', function () {
      callback();
    });
  }

  endpoint.on('error', function(error) {
    callback('Error at endpoint: ' + error);
  });

};

