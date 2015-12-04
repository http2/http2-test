// RFC 7450 Section 6.1
//   The total number of padding octets is determined by the value of the
//   Pad Length field.  If the length of the padding is the length of the
//   frame payload or greater, the recipient MUST treat this as a
//   connection error (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedGoaway = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler,
                    socketEndHandler: socketEndHandler},
  };


  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.END_HEADERS = true;
      frame.flags.END_STREAM = false;
      frame.headers[':method'] = 'POST';
      var f = {
        type: 'DATA',
        stream: 1,
        flags: {END_STREAM: true, PADDED: true},
        data: new Buffer(''),
        padlen: 255,
      }
      forward(frame);
      forward(f);
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

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Error when padding only frame was sent');
  }

  function socketEndHandler() {
    assert.strictEqual(receivedGoaway, true, 'Did not receive GOAWAY frame');
    callback();
  }

};


