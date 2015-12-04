// RFC 7450, Section 8.1.2
//    encoding in HTTP/2.  A request or response containing uppercase
//    header field names MUST be treated as malformed (Section 8.1.2.6).

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {
    fheaders['UpperCaseHeaderName'] = 'testvalue';
    return fheaders;
  });

};
