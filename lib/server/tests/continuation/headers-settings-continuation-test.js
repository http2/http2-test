// RFC 7540, Section 6.10
//    A CONTINUATION frame MUST be preceded by a HEADERS, PUSH_PROMISE or
//    CONTINUATION frame without the END_HEADERS flag set.  A recipient
//    that observes violation of this rule MUST respond with a connection
//    error (Section 5.4.1) of type PROTOCOL_ERROR.

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
      forward({
        type: 'SETTINGS',
        settings: [],
        stream: 0,
        flags: { ACK: false },
      });
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

