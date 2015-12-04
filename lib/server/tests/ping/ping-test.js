// RFC 7540, Section 6.7 PING
//    In addition to the frame header, PING frames MUST contain 8 octets of
//    opaque data in the payload.  A sender can include any value it
//    chooses and use those octets in any fashion.
//
//    Receivers of a PING frame that does not include an ACK flag MUST send
//    a PING frame with the ACK flag set in response, with an identical
//    payload.

// RFC 7540, Section 4.1
//       Flags that have no defined semantics for a particular frame type
//       MUST be ignored and MUST be left unset (0x0) when sending.


module.exports = function(host, port, log, callback, pingData) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {
      afterDecompression: afterDecompression,
      beforeCompression: beforeCompression,
    },
    eventHandlers: {
      streamEndHandler: streamEndHandler,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  var receivedPingAcks = 0;


  // PING ACK frame
  pingData = pingData || new Buffer('0102030405060708', 'hex');
  var pingFrame = {
    type: 'PING',
    stream: 0,
    flags: {
      ACK: false,
      RESERVED2: true,
      RESERVED3: true,
      RESERVED4: true,
      RESERVED5: true,
      RESERVED6: true,
      RESERVED7: true,
      RESERVED8: true,
    },
    data: pingData,
  };

  function beforeCompression (frame, forward, done) {
    forward(frame);
    if (frame.type === 'SETTINGS' && frame.flags.ACK === false) {
      forward(pingFrame);
    }
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'PING' &&
        frame.data.toString() === pingData.toString()) {

      var flags = ['RESERVED2', 'RESERVED3', 'RESERVED4', 'RESERVED5', 'RESERVED6', 'RESERVED7', 'RESERVED8'];
      for(var i = 0, len = flags.length; i < len; i++) {
        flag = flags[i];
        assert.notEqual(flag, true, 'Flag ' + flag + ' set in PING frame');
      }
      if (frame.flags.ACK === true) {
        receivedPingAcks += 1;
      } else {
        assert(0, 'Did not receive PING ACK for a PING');
      }
    }
    forward(frame);
    done();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedPingAcks, 1, 'Unexpected number of PING ACK frames');
    callback();
  }

};
