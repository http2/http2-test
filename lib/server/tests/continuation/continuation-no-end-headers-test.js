// RFC 7540, Section 6.10
//      If the END_HEADERS bit is not set, this frame MUST be followed by
//      another CONTINUATION frame.  A receiver MUST treat the receipt of
//      any other type of frame or a frame on a different stream as a
//      connection error (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression,
              beforeSerialization: beforeSerialization},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers['large-header'] = Array(16385 * 2).join("a"); // will cause framework to create CONTINUATION frame
    }
    forward(frame);
    done();
  }

  function beforeSerialization (frame, forward, done) {
    if (frame.type === 'CONTINUATION') {
      frame.flags.END_HEADERS = false;  // after this a SETTINGS ACK is sent by framework
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      receivedGoaway = true;
    }
    forward(frame);
    done();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received error that was not PROTOCOL_ERROR: ' + error);
    callback();
  }

};
