// RFC 7450, Section 6.1
//    DATA frames (type=0x0) convey arbitrary, variable-length sequences of
//    octets associated with a stream.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {beforeCompression: beforeCompression},
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
        flags: {END_STREAM: true},
        data: new Buffer(0),
      }
      forward(frame);
      forward(f);
    } else {
      forward(frame);
    }
    done();
  }

};

