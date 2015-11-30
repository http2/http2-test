// RFC 7450, Section 6.1
//       Note: A frame can be increased in size by one octet by including a
//       Pad Length field with a value of zero.

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
        flags: {END_STREAM: true, PADDED: true},
        data: new Buffer('aaa'),
        padlen: 0,
      }
      forward(frame);
      forward(f);
    } else {
      forward(frame);
    }
    done();
  }

};


