module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedRststream = false;
  var statusCode = '200';

  var endpointOptions = {
    filters: {
      beforeSerialization: beforeSerialization,
      afterDeserialization: afterDeserialization,
      afterDecompression: afterDecompression,
    },
    eventHandlers: {
      endpointErrorHandler: endpointErrorHandler,
    },
    settings: {
      SETTINGS_HEADER_TABLE_SIZE: 2048,
    }
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);
  var settingsAckd = false;



  // Integer representation code from node-http2
  function writeInteger(I, N) {
    var limit = Math.pow(2,N) - 1;
    if (I < limit) {
      return [new Buffer([I])];
    }

    var bytes = [];
    if (N !== 0) {
      bytes.push(limit);
    }
    I -= limit;

    var Q = 1, R;
    while (Q > 0) {
      Q = Math.floor(I / 128);
      R = I % 128;

      if (Q > 0) {
        R += 128;
      }
      bytes.push(R);

      I = Q;
    }

    return [new Buffer(bytes)];
  }

  function checkHeaderTableUpdate(hblock, val) {
    var exp =  writeInteger(val, 5)[0]; // table update uses 5-bit encoding
    exp[0] |= 0x20; // set the table update bit
    assert(exp.toString('ascii') === hblock.toString('ascii', 0, exp.length), 'Did not get expected Header Table Update');
  }


  function beforeSerialization(frame, forward, done) {
    // bug in framework generates GOAWAY COMPRESSION_ERROR
    // when we send SETTINGS_HEADER_TABLE_SIZE and receive a table update
    // so we don't send the GOAWAY
    if (frame.type != 'GOAWAY') {
      forward(frame);
    }
    done();
  }

  function afterDeserialization (frame, forward, done) {
    if (frame.type === 'SETTINGS' && frame.flags.ACK === true) {
      settingsAckd = true;
    }
    if (frame.type === 'HEADERS') {
      if (settingsAckd) {
        checkHeaderTableUpdate(frame.data, 2048);
      } else {
        assert(false, 'SETTINGS frame was not ACK\'d before receiving HEADERS. Test could not be completed.');
      }
    }
    forward(frame);
    done();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'RST_STREAM') {
      receivedRststream = true;
      assert.isUndefined(frame.error, 'Unexpected error ' + frame.error);
    }
    if (frame.type === 'HEADERS') {
      assert.strictEqual(frame.headers[':status'], statusCode, 'Received incorrect status code in HEADERS frame : ' + frame.headers[':status']);
    }
    forward(frame);
    done();
  }

  function endpointErrorHandler(error) {
    callback();
  }

  function streamEndHandler() {
    assert.strictEqual(receivedRststream, false, 'Received RST_STREAM frame');
    callback();
  }
};
