/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/
var http2 = require('http2');

module.exports = function(hostname, port, log, callback) {
        var url = 'https://' + hostname + ':' + port + '/server.js';
        var options = require('url').parse(url);
        options.plain = true;
        var request = http2.request(options);
        request.end();

        request.on('response', function(response) {
            log.debug('Client received response');
            callback();
        });

        request.on('error', function(error) {
            log.error('Client received error' + error);
            callback(error);
        });
};
