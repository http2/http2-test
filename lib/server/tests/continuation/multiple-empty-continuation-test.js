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
      beforeSerialization: beforeSerialization
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.END_HEADERS = false;
      var c = {
        type: 'CONTINUATION',
        stream: 1,
        data: new Buffer(''),
        flags: { END_HEADERS: false },
      }
      var cend = {
        type: 'CONTINUATION',
        stream: 1,
        data: new Buffer(''),
        flags: { END_HEADERS: true },
      }
      forward(frame);
      for (var i = 0; i < 1000; i++) {
        forward(c);
      }
      forward(cend);
    } else {
      forward(frame);
    }
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



