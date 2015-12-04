module.exports = function(host, port, log, callback, rframes, expectResp, firstStreamId) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  firstStreamId = firstStreamId || 1;

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
    },
    settings: {
      firstStreamId: firstStreamId,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);


  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'HEADERS') {
      rframes.map(forward);
    }
    done();
  }

  function checkResp() {
    assert.strictEqual(receivedRststream, false, 'Received RST_STREAM as response to RST_STREAM');
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'SETTINGS' && frame.flags.ACK === true) {
      setTimeout(checkResp, 2000);
    }
    if (frame.type === 'RST_STREAM') {
      if (frame.error !== 'STREAM_CLOSED') {
        receivedRststream = true;
      }
    }
    if (frame.type === 'HEADERS') {
      if (expectResp) {
        assert.strictEqual(frame.headers[':status'], '200', 'Received incorrect status code in HEADERS frame : ' + frame.headers[':status']);
      }
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedRststream, false, 'Received RST_STREAM frame');
    callback();
  }
};
