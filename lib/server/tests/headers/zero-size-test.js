// RFC 7450, Section 4.3
//    Header lists are collections of zero or more header fields.  When
//    transmitted over a connection, a header list is serialized into a
//    header block using HTTP header compression [COMPRESSION].

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeSerialization: beforeSerialization,
              beforeCompression: beforeCompression},
    eventHandlers: {
      endpointErrorHandler: endpointErrorHandler,
      endpointPeerErrorHandler: endpointPeerErrorHandler,
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var h2 = {
        type: 'HEADERS',
        stream: 3,
        flags: { END_STREAM: true, END_HEADERS: true},
        headers: {},
      };
      forward(frame);
      forward(h2);
    } else {
      forward(frame);
    }
    done();
  }

  function beforeSerialization(frame, forward, done) {
    if (frame.type !== 'GOAWAY') { // framework sends this. So we skip it
      forward(frame);
    }
    done();
  }

  function endpointErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Did not receive PROTOCOL_ERROR. Got: ' + error);
    assert.strictEqual(receivedRststream, true, 'Did not receive RST_STREAM frame');
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'RST_STREAM') {
      assert.strictEqual(frame.stream, 3, 'Received RST_STREAM for incorrect stream: ' + frame.stream);
      assert.strictEqual(frame.error, 'PROTOCOL_ERROR', 'Did not receive RST_STREAM PROTOCOL_ERROR. Got: ' + frame.error);
      receivedRststream = true;
    } else {
      assert.notEqual(frame.stream, 3, 'Received frames for stream that was reset: ' + frame.stream);
    }
    forward(frame);
    done();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Received incorrect error code: ' + error);
    callback();
  }
};

