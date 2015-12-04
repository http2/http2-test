// RFC 7540, Section 6.6
//    A receiver MUST treat the receipt of a PUSH_PROMISE that promises an
//    illegal stream identifier (Section 5.1.1) as a connection error
//    (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback, pingData) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression,
    },
    eventHandlers: {
      endpointErrorHandler: endpointErrorHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression (frame, forward, done) {
    forward(frame);
    if (frame.type === 'HEADERS') {
      var ppframe = {
        type: 'PUSH_PROMISE',
        promised_stream: 2,
        flags: {
          RESERVED1: true,
          RESERVED2: true,
          END_HEADERS: true,
          PADDED: false,
          RESERVED5: true,
          RESERVED6: true,
          RESERVED7: true,
          RESERVED8: true,
        },
        stream: 2,
        headers: {
          ':method': 'GET',
          ':scheme': 'https',
          ':authority': 'http2-test.example.com',
          ':path': '/pushed' 
        },
      };
      forward(ppframe);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'PROTOCOL_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
      receivedGoaway = true;
    }
    forward(frame);
    done();
  }

  function streamEndHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    assert.isUndefined(error, 'Unexpected stream error ' + error);
  }

  function endpointErrorHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received error that was not PROTOCOL_ERROR: ' + error);
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    callback();
  }
};

