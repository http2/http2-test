module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedHeaders = false;

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'HEADERS' && frame.stream === 1) {
      receivedHeaders = true;
    }
    forward(frame);
    done();
  }

  function streamEndHandler(error) {
    assert.strictEqual(receivedHeaders, true, 'Did not receive HEADERS frame');
    assert.isUndefined(error, 'Unexpected stream error ' + error);
    callback();
  }
};

