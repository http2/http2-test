// RFC 7450, Section 6.2
//       A HEADERS frame without the END_HEADERS flag set MUST be followed
//       by a CONTINUATION frame for the same stream.  A receiver MUST
//       treat the receipt of any other type of frame or a frame on a
//       different stream as a connection error (Section 5.4.1) of type
//       PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression,
              beforeSerialization: beforeSerialization},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    var cframe = {
      type: 'HEADERS',
      headers: {},
      stream: 3,
      flags: { END_STREAM: true, END_HEADERS: true },
    };

    if (frame.type === 'HEADERS') {
      forward(frame);
      forward(cframe);
    } else {
      forward(frame);
    }
    done();
  }

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      if (frame.stream === 1) {
        frame.flags.END_HEADERS = false;
        frame.flags.END_STREAM = false;
      } else {
        frame.flags.END_HEADERS = false;
        frame.flags.END_STREAM = true;
        frame.data = new Buffer('');
      }
    }
    forward(frame);
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

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Error without END_HEADERS flag');
    callback();
  }

};

