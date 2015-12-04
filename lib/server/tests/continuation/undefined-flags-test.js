// RFC 7540, Section 4.1
//       Flags that have no defined semantics for a particular frame type
//       MUST be ignored and MUST be left unset (0x0) when sending.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  statusCode = '200';

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression,
      beforeSerialization: beforeSerialization
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.headers['large-header'] = Array(16385 * 2).join("a"); // will cause framework to create CONTINUATION frame
    }
    forward(frame);
    done();
  }

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'CONTINUATION') {
      frame.flags.RESERVED1 = true;
      frame.flags.RESERVED2 = true;
      frame.flags.RESERVED4 = true;
      frame.flags.RESERVED5 = true;
      frame.flags.RESERVED6 = true;
      frame.flags.RESERVED7 = true;
      frame.flags.RESERVED8 = true;
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

