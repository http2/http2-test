// RFC 7540, Section 6.4
//    RST_STREAM frames MUST NOT be sent for a stream in the "idle" state.
//    If a RST_STREAM frame identifying an idle stream is received, the
//    recipient MUST treat this as a connection error (Section 5.4.1) of
//    type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {
  var rframes = [{
    type: 'RST_STREAM',
    error: 'NO_ERROR',
    stream: 7,
  }];

  require('./expect-error')(host, port, log, callback, rframes, 'PROTOCOL_ERROR');
};
