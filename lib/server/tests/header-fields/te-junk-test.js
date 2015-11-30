// RFC 7450, Section 8.1.2.2
//    specific metadata is conveyed by other means.  An endpoint MUST NOT
//    generate an HTTP/2 message containing connection-specific header
//    fields; any message containing connection-specific header fields MUST
//    be treated as malformed (Section 8.1.2.6).
//
//    The only exception to this is the TE header field, which MAY be
//    present in an HTTP/2 request; when it is, it MUST NOT contain any
//    value other than "trailers".

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {
      fheaders['te'] = 'junk';
      return fheaders;
  });

};
