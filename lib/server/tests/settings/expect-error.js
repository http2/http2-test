module.exports = function(host, port, log, callback, sframes, expectedErr) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedErrFrame = false;
  var expectedErr = expectedErr || 'PROTOCOL_ERROR';

  var expectedErrFrame = 'GOAWAY';
  var receivedHeaders = false;
  var receivedErr;

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
      endpointErrorHandler: endpointErrorHandler,
    },
    settings: {
      firstStreamId: 3,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS' && frame.flags.ACK === true) {
      if (sframes instanceof Buffer) {
        endpoint._serializer.push(sframes);  // custom frames are written directly
      } else {
        sframes.map(forward);
      }
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'HEADERS' || frame.type === 'DATA') {
      receivedHeaders = true;
    }
    if (frame.type === expectedErrFrame) {
      receivedErrFrame = true;
      receivedErr = frame.error;
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedErrFrame, true, 'Did not receive ' + expectedErrFrame + ' frame');
    assert.strictEqual(receivedErr, expectedErr, 'Received incorrect error code: ' + receivedErr);
    assert.strictEqual(receivedHeaders, false, 'Received HEADERS frame');
  }

  function endpointErrorHandler(error) {
    // this is triggered sometimes with an error as the server has already closed the connection
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedErrFrame, true, 'Did not receive ' + expectedErrFrame + ' frame');
    assert.strictEqual(receivedErr, expectedErr, 'Received incorrect error code: ' + receivedErr);
    assert.strictEqual(receivedHeaders, false, 'Received HEADERS frame');
    callback();
  }
};
