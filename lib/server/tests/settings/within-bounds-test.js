// RFC 7540, Section 6.5.2
//    An endpoint that receives a SETTINGS frame with any unknown or
//    unsupported identifier MUST ignore that setting.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  var statusCode = '200';

  // we need many frames as one frame is oversized if it includes all unknown values
  var unknownSettings = [];
  var t = {};
  var last = 7;
  for (var i = 7; i < Math.pow(2, 16); i++) {
    t[i] = 0xffffffff;
    if (i - last >= 2729) {  // 2729 ~=  16384/6 (6 bytes per setting)
      unknownSettings.push(t);
      last = i;
      t = {};
    }
  }
  if (Object.keys(t).length > 0) {
    unknownSettings.push(t);
  }

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS' && frame.flags.ACK == false) {
      unknownSettings.forEach(function(setlist, id) {
        var frame2 = {
          type: 'SETTINGS',
          flags: {
            RESERVED2: true,
            RESERVED3: true,
            RESERVED4: true,
            RESERVED5: true,
            RESERVED6: true,
            RESERVED7: true,
            RESERVED8: true,
          },
          settings: setlist,
          stream: 0,
        };
        forward(frame2);
      });
    }
    if (frame.type === 'HEADERS') {
      forward({  // empty SETTINGS in middle of session
        type: 'SETTINGS',
        settings: [],
        stream: 0,
      });
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'SETTINGS') {  // check for undefined flags
      var flags = ['RESERVED2', 'RESERVED3', 'RESERVED4', 'RESERVED5', 'RESERVED6', 'RESERVED7', 'RESERVED8'];
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
