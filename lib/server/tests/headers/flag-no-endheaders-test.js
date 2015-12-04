// RFC 7450, Section 6.2
//       A HEADERS frame without the END_HEADERS flag set MUST be followed
//       by a CONTINUATION frame for the same stream.  A receiver MUST
//       treat the receipt of any other type of frame or a frame on a
//       different stream as a connection error (Section 5.4.1) of type
//       PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

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
      receivedGoaway = true;
    }
    forward(frame);
    done();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Error without END_HEADERS flag');
    callback();
  }

};

