// RFC 7540, Section 5.2.1
//    2.  Flow control is based on WINDOW_UPDATE frames.  Receivers
//        advertise how many octets they are prepared to receive on a
//        stream and for the entire connection.  This is a credit-based
//        scheme.

module.exports = function(host, port, log, callback, openConnWindow) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedData = false;

  var endpointOptions = {
    filters: {
      beforeCompression: beforeCompression,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
    },
    settings: {
      'SETTINGS_INITIAL_WINDOW_SIZE': 0,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);


  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS' && frame.flags.ACK === false) {
      if (openConnWindow) {
        forward({
          type: 'WINDOW_UPDATE',
          window_size: 65535,     // only increase connection window
          stream: 0,
        });
      }
    }
    done();
  }

  function checkResp() {
    assert.strictEqual(receivedData, false, 'Received DATA frame');
    callback();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'SETTINGS' && frame.flags.ACK === true) {
      setTimeout(checkResp, 1000);
    }
    if (frame.type === 'DATA') {
      receivedData = true;
    }
    if (frame.type === 'HEADERS') {
      assert.strictEqual(frame.headers[':status'], '200', 'Received incorrect status code in HEADERS frame : ' + frame.headers[':status']);
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedData, false, 'Received DATA frame');
    callback();
  }
};
