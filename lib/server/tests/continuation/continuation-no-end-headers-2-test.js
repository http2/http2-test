// RFC 7540, Section 6.10
//      If the END_HEADERS bit is not set, this frame MUST be followed by
//      another CONTINUATION frame.  A receiver MUST treat the receipt of
//      any other type of frame or a frame on a different stream as a
//      connection error (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedResp = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression,
              beforeSerialization: beforeSerialization},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers['large-header'] = Array(16385 * 2).join("a"); // will cause framework to create CONTINUATION frame
    }
    forward(frame);
    done();
  }

  function checkResp() {
    assert.strictEqual(receivedResp, false, 'Received response without END_HEADERS in CONTINUATION frame');
    callback();
  }


  function beforeSerialization (frame, forward, done) {
    if (frame.type === 'CONTINUATION') {
      frame.flags.END_HEADERS = false;
    }
    if (frame.type === 'SETTINGS' && frame.flags.ACK === true) {
      //forward(frame);  // do not forward frame as it'll trigger an immediate error
      setTimeout(checkResp, 3000);
    } else {
      forward(frame);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'HEADERS' || frame.type === 'DATA') {
      receivedResp = true;
    }
    forward(frame);
    done();
  }

};


