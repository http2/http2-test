// RFC 7540, Section 4.1
//       Flags are assigned semantics specific to the indicated frame type.
//       Flags that have no defined semantics for a particular frame type
//       MUST be ignored and MUST be left unset (0x0) when sending.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {streamEndHandler: streamEndHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);
  var undefFlagsIgnoredTest = false;

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'HEADERS') {
      var f = {
        type: 'WINDOW_UPDATE',
        window_size: 0x80000001, // reserved bit set
        stream: 1,
        flags: {
          RESERVED1: true,
          RESERVED2: true,
          RESERVED3: true,
          RESERVED4: true,
          RESERVED5: true,
          RESERVED6: true,
          RESERVED7: true,
          RESERVED8: true,
        },
      }
      forward(f);
      undefFlagsIgnoredTest = true;
    }
    done();
  }

  function streamErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
  }

  function streamEndHandler(error) {
    assert.strictEqual(undefFlagsIgnoredTest, true, 'Did not complete WINDOW_UPDATE frame undef flags ignored test');
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
    callback();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'WINDOW_UPDATE') {
      var flags = ['RESERVED1', 'RESERVED2', 'RESERVED3', 'RESERVED4', 'RESERVED5', 'RESERVED6', 'RESERVED7', 'RESERVED8'];
      for(var i = 0, len = flags.length; i < len; i++) {
        flag = flags[i];
        assert.notEqual(flag, true, 'Undefined flag ' + flag + ' set in ' + frame.type + ' frame');
      }
    }
    forward(frame);
    done();
  }

};

