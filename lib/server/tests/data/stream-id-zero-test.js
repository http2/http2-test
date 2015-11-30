// RFC 7450, Section 6.1
//    DATA frames MUST be associated with a stream.  If a DATA frame is
//    received whose stream identifier field is 0x0, the recipient MUST
//    respond with a connection error (Section 5.4.1) of type
//    PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {endpointPeerErrorHandler: endpointPeerErrorHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      var f = {
        type: 'DATA',
        stream: 0,
        flags: {},
        data: new Buffer(0),
      }
      forward(f);
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'PROTOCOL_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
    }
    forward(frame);
    done();
  }

  function endpointPeerErrorHandler(error) {
    assert.strictEqual(error, 'PROTOCOL_ERROR', 'Error when large frame was sent');
    callback();
  }

};


