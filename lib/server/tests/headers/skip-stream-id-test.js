// RFC 7450, Section 5.1.1
//    The first use of a new stream identifier implicitly closes all
//    streams in the "idle" state that might have been initiated by that
//    peer with a lower-valued stream identifier.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression},
    eventHandlers: {endpointErrorHandler: endpointErrorHandler},
    settings: {firstStreamId: 15},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'GOAWAY') {
      assert.strictEqual(frame.error, 'NO_ERROR', 'Received GOAWAY with incorrect error code: ' + frame.error);
    }
    forward(frame);
    done();
  }

  function endpointErrorHandler(error) {
    assert.strictEqual(error, 'NO_ERROR', 'Error when max stream id frame was sent');
    callback();
  }

};
