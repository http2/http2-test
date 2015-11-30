module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler,
                    streamEndHandler: streamEndHandler},
    settings: {firstStreamId: 5},
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


