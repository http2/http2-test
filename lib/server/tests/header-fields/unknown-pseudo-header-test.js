// RFC 7450, Section 8.1.2.1
//    trailers.  Endpoints MUST treat a request or response that contains
//    undefined or invalid pseudo-header fields as malformed
//    (Section 8.1.2.6).

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {
    fheaders[':user-agent'] = 'the-nodey-crawly';
    return fheaders;
  });

};

