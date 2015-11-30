// RFC 7540, Section 6.9.2
//    A change to SETTINGS_INITIAL_WINDOW_SIZE can cause the available
//    space in a flow-control window to become negative.  A sender MUST
//    track the negative flow-control window and MUST NOT send new flow-
//    controlled frames until it receives WINDOW_UPDATE frames that cause
//    the flow-control window to become positive.

module.exports = function(host, port, log, callback, iframes) {

  var h2endpoint = require('../create-endpoint');
  var assert = require('chai').assert;
  var receivedData = false;

  var endpointOptions = {
    filters: {afterDecompression: afterDecompression,
              beforeCompression: beforeCompression},
    eventHandlers: {streamEndHandler: streamEndHandler},
  };

  var endpoint = new h2endpoint(host, port, log, callback, endpointOptions);
  var undefFlagsIgnoredTest = false,
      undefFlagsUnsetTest = false;

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.flags.END_HEADERS = true;
      frame.flags.END_STREAM = false;
      frame.headers[':method'] = 'POST';
      frame.headers['content-length'] = '65535';

      forward(frame);
      var f = {
        type: 'DATA',
        stream: 1,
        flags: {},
        data: new Buffer(16000),
      };
      forward(f);
      forward(f);
      forward(f);
      forward(f);
      f.flags.END_STREAM = true;
      f.data = new Buffer(1535);
      forward(f);
    } else {
      forward(frame);
    }
    done();
  }

  function streamErrorHandler(error) {
    assert.isUndefined(error, 'Unhandled error in stream: ' + error);
  }

  function streamEndHandler() {
    callback();
  }

  function afterDecompression (frame, forward, done) {
    if (frame.type === 'HEADERS') {
      assert.strictEqual(frame.headers[':status'], '200', 'Received incorrect status code in HEADERS frame : ' + frame.headers[':status']);
    }
    assert.notStrictEqual(frame.type, 'RST_STREAM', 'Received RST_STREAM');
    forward(frame);
    done();
  }
};
