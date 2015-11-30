// RFC 7450, Section 6.10
//       If the END_HEADERS bit is not set, this frame MUST be followed by
//       another CONTINUATION frame.  A receiver MUST treat the receipt of
//       any other type of frame or a frame on a different stream as a
//       connection error (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeSerialization: beforeSerialization},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.END_HEADERS = false;
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'PROTOCOL_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
    }
    forward(frame);
    done();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Error when large frame was sent');
    callback();
  }

};


