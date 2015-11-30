// RFC 7540, Section 6.7 PING
//       response.  An endpoint MUST set this flag in PING responses.  An
//       endpoint MUST NOT respond to PING frames containing this flag.


module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression
    },
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);



  // PING ACK frame
  var pingData = new Buffer('0102030405060708', 'hex');
  var pingFrame = {
    type: 'PING',
    stream: 0,
    flags: { ACK: true },
    data: pingData,
  };

  function beforeCompression (frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS') {
      forward(pingFrame);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'PING' &&
        frame.flags.ACK === true &&
        frame.data.toString() === pingData.toString()) {
      assert(0, 'Received PING ACK for a PING ACK');
    }
    forward(frame);
    done();
  }

};

