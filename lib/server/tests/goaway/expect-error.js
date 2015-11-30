module.exports = function(host, port, log, callback, iframes, expectedErr) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;
  expectedErr = expectedErr || 'PROTOCOL_ERROR';

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
      socketEndHandler: socketEndHandler,
    },
    settings: {
      firstStreamId: 3,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.flags.END_STREAM === true && typeof iframes != 'undefined') {
      if (iframes instanceof Buffer) {
        endpoint.push(iframes);  // custom frames are written directly
      } else {
        iframes.map(forward);
      }
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY' && frame.error === expectedErr) {
      receivedGoaway = true;
      assert.strictEqual(frame.stream & 0x80000000, 0, 'Reserved bit set in ' + frame.type + ' frame');
      var flags = ['RESERVED1', 'RESERVED2', 'RESERVED3', 'RESERVED4', 'RESERVED5', 'RESERVED6', 'RESERVED7', 'RESERVED8'];
      for(var i = 0, len = flags.length; i < len; i++) {
        flag = flags[i];
        assert.notEqual(flag, true, 'Undefined flag ' + flag + ' set in ' + frame.type + ' frame');
        undefFlagsUnsetTest = true;
      }
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame with ' + expectedErr);
    callback();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame with ' + expectedErr);
  }

  function socketEndHandler() {
  }
};
