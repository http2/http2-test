// RFC 7540, Section 6.4
//    RST_STREAM frames MUST be associated with a stream.  If a RST_STREAM
//    frame is received with a stream identifier of 0x0, the recipient MUST
//    treat this as a connection error (Section 5.4.1) of type
//    PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {
  var rframes = [{
    type: 'RST_STREAM',
    error: 'NO_ERROR',
    stream: 0,
  }];

  require('./expect-error')(host, port, log, callback, rframes, 'PROTOCOL_ERROR');
};
