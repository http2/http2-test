module.exports = function(host, port, log, callback, pingFrame, errorType) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedErrFrame = false;
  var errorType = errorType || 'FRAME_SIZE_ERROR';

  var errFrameType = 'GOAWAY';

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS' && frame.flags.ACK === false) {
      forward(pingFrame);
    }
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

