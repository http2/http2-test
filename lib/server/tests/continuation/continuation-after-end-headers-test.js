// RFC 7450 Section 6.10
//   A CONTINUATION frame MUST be preceded by a HEADERS, PUSH_PROMISE or
//   CONTINUATION frame without the END_HEADERS flag set.  A recipient
//   that observes violation of this rule MUST respond with a connection
//   error (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression
    },
    eventHandlers: {
      endpointPeerErrorHandler: endpointPeerErrorHandler,
      streamEndHandler: streamEndHandler
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var c = {
        type: 'CONTINUATION',
        stream: 1,
        data: new Buffer(''),
        flags: { END_HEADERS: false },
      }
      forward(frame);
      forward(c);
    } else {
      forward(frame);
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

  function streamEndHandler() {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received error that was not PROTOCOL_ERROR: ' + error);
    callback();
  }

};


