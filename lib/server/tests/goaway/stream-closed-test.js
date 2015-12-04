// RFC 7450, Section 6.8
//    An endpoint MUST treat a GOAWAY frame with a stream identifier other
//    than 0x0 as a connection error (Section 5.4.1) of type
//    PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var iframes = [{
    stream: 1,
    type: 'GOAWAY',
    error: 'NO_ERROR',
    last_stream: 3,
    flags: {},
  }];

  require('./expect-error')(host, port, log, callback, iframes);
}
