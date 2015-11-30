// RFC 7540, Section 6.4
//    causes it to enter the "closed" state.  After receiving a RST_STREAM
//    on a stream, the receiver MUST NOT send additional frames for that
//    stream, with the exception of PRIORITY.

module.exports = function(host, port, log, callback) {
  var rframes = [{
    type: 'RST_STREAM',
    error: 'NO_ERROR',
    stream: 1,
    flags: {
      RESERVED1: true,
      RESERVED2: true,
      RESERVED3: true,
      RESERVED4: true,
      RESERVED5: true,
      RESERVED6: true,
      RESERVED7: true,
      RESERVED8: true,
    },
  }];

  require('./expect-no-error')(host, port, log, callback, rframes);
};
