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
              beforeCompression: beforeCompression,
              beforeSerialization: beforeSerialization},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler,
                    streamEndHandler: streamEndHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var frame2 = JSON.parse(JSON.stringify(frame)); // clone frame
      frame2.stream = 3;
      forward(frame);
      forward(frame2);
    } else {
      forward(frame);
    }
    done();
  }

  function beforeSerialization (frame, forward, done) {
    if (frame.type === 'HEADERS' && frame.stream === 1) {
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

  function streamEndHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    assert.isUndefined(error, 'Unexpected stream error ' + error);
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received error that was not PROTOCOL_ERROR: ' + error);
    callback();
  }

};


