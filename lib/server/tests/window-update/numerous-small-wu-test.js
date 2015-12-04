// RFC 7540, Section 5.2.1
//    2.  Flow control is based on WINDOW_UPDATE frames.  Receivers
//        advertise how many octets they are prepared to receive on a
//        stream and for the entire connection.  This is a credit-based
//        scheme.

module.exports = function(host, port, log, callback, iframes) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedData = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {streamEndHandler: streamEndHandler},
    settings: {
        'SETTINGS_INITIAL_WINDOW_SIZE': 0,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);
  var undefFlagsIgnoredTest = false,
      undefFlagsUnsetTest = false;

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'HEADERS') {
      // send many WINDOW_UPDATE frames for both stream and window
      for (var i = 0; i < 6500; i ++) {
        forward({
          type: 'WINDOW_UPDATE',
          window_size: 10,
          stream: 0,
        });
        forward({
          type: 'WINDOW_UPDATE',
          window_size: 10,
          stream: 1,
        });
      }
    }
    done();
  }

  function streamErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
  }

  function streamEndHandler() {
    assert.strictEqual(receivedData, true, 'Did not receive DATA frame');
    callback();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'HEADERS') {
      assert.strictEqual(frame.headers[':status'], '200', 'Received incorrect status code in HEADERS frame : ' + frame.headers[':status']);
    }
    if (frame.type === 'DATA') {
      receivedData = true;
    }
    forward(frame);
    done();
  }

};
