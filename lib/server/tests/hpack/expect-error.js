module.exports = function(host, port, log, callback, prepareHeaders, mungeHeaders, errorType, socketErrorCode) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedErrFrame = false;
  var errorType = errorType || 'COMPRESSION_ERROR';

  var errFrameType = 'RST_STREAM';
  if (errorType === 'COMPRESSION_ERROR') {
    errFrameType = 'GOAWAY';
  }

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      beforeSerialization: beforeSerialization,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
      socketErrorHandler: socketErrorHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers = prepareHeaders(frame.headers);
    }
    forward(frame);
    done();
  }

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      if (typeof mungeHeaders != 'undefined') {
        frame.data = mungeHeaders(frame.data);
      }
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === errFrameType) {
      assert.strictEqual(frame.error, errorType, 'Received ' + errFrameType + ' with incorrect error code: ' + frame.error);
      receivedErrFrame = true;
    }
    forward(frame);
    done();
  }

  function socketErrorHandler(error) {
    // socket is reset in some cases
    assert.strictEqual(error.code, socketErrorCode, 'Received socket error ' + error.code);
    callback();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedErrFrame, true, 'Did not receive ' + errFrameType + ' frame');
    callback();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedErrFrame, true, 'Did not receive ' + errFrameType + ' frame');
    assert.strictEqual(error, errorType, 'Received unexpected error in ' + errFrameType + ': ' + error);
    callback();
  }

};


