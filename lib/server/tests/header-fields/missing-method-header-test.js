// RFC 7450, Section 8.1.2.3
//    All HTTP/2 requests MUST include exactly one valid value for the
//    ":method", ":scheme", and ":path" pseudo-header fields, unless it is
//    a CONNECT request (Section 8.3).  An HTTP request that omits
//    mandatory pseudo-header fields is malformed (Section 8.1.2.6).

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {
    delete fheaders[':method'];
    return fheaders;
  });

};

