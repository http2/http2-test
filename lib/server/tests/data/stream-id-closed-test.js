// RFC 7450, Section 6.1
//                                           If a DATA frame is received
//    whose stream is not in "open" or "half-closed (local)" state, the
//    recipient MUST respond with a stream error (Section 5.4.2) of type
//    STREAM_CLOSED.


module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRst = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {streamEndHandler: streamEndHandler,
                    endpointPeerErrorHandler: endpointPeerErrorHandler},
    settings: {firstStreamId: 5},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var f = {
        type: 'DATA',
        stream: 3,
        flags: {},
        data: new Buffer(0),
      }
      forward(frame);
      forward(f);
    } else {
      forward(frame);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'RST_STREAM') {
      assert.strictEqual(frame.error, 'STREAM_CLOSED', 'Received RST_STREAM with incorrect error code: ' + frame.error);
      receivedRst = true;
    }
    forward(frame);
    done();
  }

  function streamEndHandler(error) {
    assert.isTrue(receivedRst, 'Did not received RST_STREAM frame');
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'STREAM_CLOSED', 'Received error "' + error + '" instead of STREAM_CLOSED');
    callback();
  }

};


