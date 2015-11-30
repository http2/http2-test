// RFC 7450, Section 5.3.1
//    A stream that is not dependent on any other stream is given a stream
//    dependency of 0x0.  In other words, the non-existent stream 0 forms
//    the root of the tree.

module.exports = function(host, port, log, callback) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;

  var endpointOptions = {
    filters: {beforeCompression: beforeCompression},
    eventHandlers: {streamEndHandler: streamEndHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.PRIORITY = true;
      frame.priorityDependency = 0;
      frame.exclusiveDependency = 0;
      frame.priorityWeight = 100;
    }
    forward(frame);
    done();
  }


  function streamEndHandler(error) {
    assert.isUndefined(error, 'Error in stream: ' + error);
    callback();
  }
};

