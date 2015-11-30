// RFC 7450, Section 4.1
//    R: A reserved 1-bit field.  The semantics of this bit are undefined,
//       and the bit MUST remain unset (0x0) when sending and MUST be
//       ignored when receiving.

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
      frame.reserved = true; // sets frame reserved bit
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    assert.isFalse(frame.reserved, 'Frame reserved bit set in response');
    forward(frame);
    done();
  }

};
