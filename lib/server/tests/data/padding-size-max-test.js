// RFC 7450, Section 6.1
//   DATA frames MAY also contain padding.  Padding can be added to DATA
//   frames to obscure the size of messages.  Padding is a security
//   feature; see Section 10.7.

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
      frame.flags.END_HEADERS = true;
      frame.flags.END_STREAM = false;
      frame.headers[':method'] = 'POST';
      var f = {
        type: 'DATA',
        stream: 1,
        flags: {END_STREAM: true, PADDED: true},
        data: new Buffer('aaa'),
        padlen: 255,
      }
      forward(frame);
      forward(f);
    } else {
      forward(frame);
    }
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


