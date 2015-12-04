// RFC 7450, Section 4.2
//    An endpoint MUST send an error code of FRAME_SIZE_ERROR if a frame
//    exceeds the size defined in SETTINGS_MAX_FRAME_SIZE, exceeds any
//    limit defined for the frame type, or is too small to contain
//    mandatory frame data.  A frame size error in a frame that could alter
//    the state of the entire connection MUST be treated as a connection
//    error (Section 5.4.1); this includes any frame carrying a header
//    block (Section 4.3) (that is, HEADERS, PUSH_PROMISE, and
//    CONTINUATION), SETTINGS, and any frame with a stream identifier of 0.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {endpointErrorHandler: endpointErrorHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var f = {
        type: 'DATA',
        stream: 1,
        flags: {},
        data: new Buffer(16386), // range is 16384 (2^14-1) to 16777215 (2^24-1)
      }
      forward(f);
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'FRAME_SIZE_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
    }
    forward(frame);
    done();
  }

  function endpointErrorHandler(error) {
    assert.strictEqual(error, 'FRAME_SIZE_ERROR', 'Error when large frame was sent');
    callback();
  }

};

