module.exports = function(host, port, log, callback, pframes) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  var statusCode = '200';

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
    },
    settings: {
      firstStreamId: 5,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'HEADERS') {
      pframes.map(forward);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'PRIORITY') {
      var flags = ['RESERVED1', 'RESERVED2', 'RESERVED3', 'RESERVED4', 'RESERVED5', 'RESERVED6', 'RESERVED7', 'RESERVED8'];
      flags.map(function (flag) {
        assert.notEqual(flag, true, 'Flag ' + flag + ' set in PRIORITY frame');
      });
    }
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

