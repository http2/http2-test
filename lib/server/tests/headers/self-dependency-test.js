// RFC 7450, Section 5.3.1
//    A stream cannot depend on itself.  An endpoint MUST treat this as a
//    stream error (Section 5.4.2) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression,
              beforeSerialization: beforeSerialization},
    eventHandlers: {
      streamEndHandler: streamEndHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.PRIORITY = true;
      frame.priorityDependency = 1;
      frame.exclusiveDependency = 1;
      frame.priorityWeight = 100;
    }
    forward(frame);
    done();
  }

  function beforeSerialization(frame, forward, done) {
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'RST_STREAM') {
      assert.strictEqual(frame.error, 'PROTOCOL_ERROR', 'Received RST_STREAM with incorrect error code: ' + frame.error);
      receivedRststream = true;
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedRststream, true, 'Did not receive RST_STREAM frame');
    callback();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedRststream, true, 'Did not receive RST_STREAM frame');
    callback();
  }

};
