// RFC 7540, Section 6.10
// 6.10.  CONTINUATION
//
//    The CONTINUATION frame (type=0x9) is used to continue a sequence of
//    header block fragments (Section 4.3).  Any number of CONTINUATION
//    frames can be sent, as long as the preceding frame is on the same
//    stream and is a HEADERS, PUSH_PROMISE, or CONTINUATION frame without
//    the END_HEADERS flag set.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler,
                    streamEndHandler: streamEndHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var c = {
        type: 'CONTINUATION',
        stream: 1,
        data: new Buffer(''),
        flags: { END_HEADERS: true },
      }
      forward(c);
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

