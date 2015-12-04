// RFC 7450, Section 6.1
//       Padding octets MUST be set to zero when sending.  A receiver is
//       not obligated to verify padding but MAY treat non-zero padding as
//       a connection error (Section 5.4.1) of type PROTOCOL_ERROR.

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
      frame.flags.PADDED = true;
      frame.padding = new Buffer('AAAAAAA');
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'NO_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
      receivedGoaway = true;
    }
    forward(frame);
    done();
  }

  function streamEndHandler(error) {
    assert.isUndefined(error, 'Received a stream error ' + error);
    callback();
  }

  function endpointPeerErrorHandler(error) {
    assert.isUndefined(error, 'Received a peer error ' + error);
    callback();
  }

};
