// RFC 7540, Section 4.1
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
  var undefFlagsIgnoredTest = false,
      undefFlagsUnsetTest = false;

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.END_HEADERS = true;
      frame.flags.RESERVED2 = true;
      frame.flags.RESERVED5 = true;
      frame.flags.RESERVED7 = true;
      frame.flags.RESERVED8 = true;
      undefFlagsIgnoredTest = true;
    }
    forward(frame);
    done();
  }

  function streamErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
  }

  function streamEndHandler(error) {
    assert.strictEqual(undefFlagsIgnoredTest, true, 'Did not complete HEADERS frame undef flags ignored test');
    assert.strictEqual(undefFlagsUnsetTest, true, 'Did not complete HEADERS frame undef flags unset test');
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
    callback();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var flags = ['RESERVED2', 'RESERVED5', 'RESERVED7', 'RESERVED8'];
      for(var i = 0, len = flags.length; i < len; i++) {
        flag = flags[i];
        assert.notEqual(flag, true, 'Flag ' + flag + ' set in HEADERS frame');
        undefFlagsUnsetTest = true;
      }
    }
    forward(frame);
    done();
  }

};
