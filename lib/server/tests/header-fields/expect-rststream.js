module.exports = function(host, port, log, callback, processHeaders) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression
    },
    eventHandlers: {
      endpointPeerErrorHandler: endpointPeerErrorHandler,
      streamEndHandler: streamEndHandler,
      streamErrorHandler: streamEndHandler,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers = processHeaders(frame.headers);
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'RST_STREAM') {
      assert.strictEqual(frame.error, 'PROTOCOL_ERROR', 'Received RST_STREAM with incorrect error code: ' + frame.error);
      receivedRststream = true;
      callback();
    }
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.type, 'RST_STREAM', 'Received incorrect error frame' + frame.type);
      callback();
    }
    forward(frame);
    done();
  }

  function streamEndHandler(error) {
    assert.strictEqual(receivedRststream, true, 'Did not receive RST_STREAM frame');
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received error that was not PROTOCOL_ERROR: ' + error);
  }

};


