// RFC 7450, Section 4.1
//    Type:  The 8-bit type of the frame.  The frame type determines the
//       format and semantics of the frame.  Implementations MUST ignore
//       and discard any frame that has a type that is unknown.


module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      forward(frame);
      for(t = 10; t < 16; t++) {
        var f = {
          type: t,
          stream: 0,
          flags: {},
        }
        forward(f);
      }
    } else {
      forward(frame);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'NO_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
      callback();
    }
    forward(frame);
    done();
  }

};

