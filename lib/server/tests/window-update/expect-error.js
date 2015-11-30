module.exports = function(host, port, log, callback, iframes, expectedErr, expectedErrFrame) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedErrFrame = false;
  expectedErr = expectedErr || 'PROTOCOL_ERROR';
  expectedErrFrame = expectedErrFrame || 'GOAWAY';
  var receivedErr;

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      endpointPeerErrorHandler: endpointPeerErrorHandler,
    },
    settings: {
      firstStreamId: 3,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS' && frame.flags.ACK === true) {
      if (iframes instanceof Buffer) {
        endpoint.push(iframes);  // custom frames are written directly
      } else {
        iframes.map(forward);
      }
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === expectedErrFrame) {
      receivedErrFrame = true;
      receivedErr = frame.error;
    }
    forward(frame);
    done();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedErrFrame, true, 'Did not receive ' + expectedErrFrame + ' frame');
    assert.strictEqual(receivedErr, expectedErr, 'Received ' + expectedErrFrame + ' with incorrect error code: ' + receivedErr);
    callback();
  }
};
