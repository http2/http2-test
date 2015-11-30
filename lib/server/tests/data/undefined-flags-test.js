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
      frame.flags.END_STREAM = false;
      frame.headers[':method'] = 'POST';
      var f = {
        type: 'DATA',
        stream: 1,
        flags: {
          END_STREAM: true,
          RESERVED2: true,
          RESERVED3: true,
          RESERVED5: true,
          RESERVED6: true,
          RESERVED7: true,
          RESERVED8: true,
        },
        data: new Buffer(''), // empty data so we don't have to mess with content length
      }
      forward(frame);
      forward(f);
      undefFlagsIgnoredTest = true;
    } else {
      forward(frame);
    }
    done();
  }

  function streamErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
  }

  function streamEndHandler(error) {
    assert.strictEqual(undefFlagsIgnoredTest, true, 'Did not complete DATA frame undef flags ignored test');
    assert.strictEqual(undefFlagsUnsetTest, true, 'Did not complete DATA frame undef flags unset test');
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
    callback();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'DATA') {
      var flags = ['RESERVED2', 'RESERVED3', 'RESERVED5', 'RESERVED6', 'RESERVED7', 'RESERVED8'];
      for(var i = 0, len = flags.length; i < len; i++) {
        flag = flags[i];
        assert.notEqual(flag, true, 'Flag ' + flag + ' set in DATA frame');
        undefFlagsUnsetTest = true;
      }
    }
    forward(frame);
    done();
  }

};

