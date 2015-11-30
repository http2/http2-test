module.exports = function(host, port, log, callback, prepareHeaders, mungeHeaders) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  var statusCode = '200';

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      beforeSerialization: beforeSerialization,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers = prepareHeaders(frame.headers);
    }
    forward(frame);
    done();
  }

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      if (typeof mungeHeaders != 'undefined') {
        frame.data = mungeHeaders(frame.data);
      }
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

