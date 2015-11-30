// RFC 7540, Section 6.10
//  6.10.  CONTINUATION
//
//     The CONTINUATION frame (type=0x9) is used to continue a sequence of
//     header block fragments (Section 4.3).  Any number of CONTINUATION
//     frames can be sent, as long as the preceding frame is on the same
//     stream and is a HEADERS, PUSH_PROMISE, or CONTINUATION frame without
//     the END_HEADERS flag set.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  statusCode = '200';

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers['large-header'] = Array(16385 * 2).join("a"); // will cause framework to create CONTINUATION frame
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'RST_STREAM') {
      receivedRststream = true;
      assert.isUndefined(frame.error, 'Unexpected error ' + frame.error);
    }
    if (frame.type === 'HEADERS') {
      assert.strictEqual(frame.headers[':status'], statusCode, 'Received incorrect status code in HEADERS frame : ' + frame.headers[':status']);
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedRststream, false, 'Received RST_STREAM frame');
    callback();
  }
};

