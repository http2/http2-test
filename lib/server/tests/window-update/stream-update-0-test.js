// RFC 7540, Section 6.9
//    A receiver MUST treat the receipt of a WINDOW_UPDATE frame with an
//    flow-control window increment of 0 as a stream error (Section 5.4.2)
//    of type PROTOCOL_ERROR; errors on the connection flow-control window
//    MUST be treated as a connection error (Section 5.4.1).

module.exports = function(host, port, log, callback) {

  var iframes = [{
    type: 'WINDOW_UPDATE',
    window_size: 0,
    stream: 3,
  }];

  require('./expect-error')(host, port, log, callback, iframes, 'PROTOCOL_ERROR', 'RST_STREAM');
};
