// RFC 7450, Section 6.2
//    identical to those defined for DATA frames (Section 6.1).  Padding
//    that exceeds the size remaining for the header block fragment MUST be
//    treated as a PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {
      endpointPeerErrorHandler: endpointPeerErrorHandler,
      streamEndHandler: streamEndHandler,
      streamErrorHandler: streamErrorHandler,
    },
  };


  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') { // frame size is around 32 bytes
      frame.flags.PADDED = true;
      frame.padlen = 100;
      frame.padding = new Buffer(''); // actual padding is zero
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
    assert.isUndefined(error, 'Received a stream error ' + error);
    assert.isTrue(receivedGoaway, 'Did not receive GOAWAY frame');
  }

  function streamErrorHandler(error) {}

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received incorrect error code: ' + error);
    callback();
  }

};
