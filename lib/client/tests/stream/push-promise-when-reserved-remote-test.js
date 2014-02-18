// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the BSD 2-Clause License.

// See ../invalid-frame-when-reserved-remote.js

var invalidFrameWhenReservedRemoteTest = require('./invalid-frame-when-reserved-remote');

module.exports = function(socket, log, callback) {
  invalidFrameWhenReservedRemoteTest(socket, log, callback, function(stream) {
    return {
      type: 'PUSH_PROMISE',
      flags: {},
      promised_stream: 10,
      headers: {
        ':method': 'GET',
        ':scheme': 'https',
        ':authority': 'localhost',
        ':path': 'promised-resource-2'
      },
      stream: 10
    };
  });
};