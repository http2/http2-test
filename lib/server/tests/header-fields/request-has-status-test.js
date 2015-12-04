// RFC 7450, Section 8.1.2.1
//    Pseudo-header fields are only valid in the context in which they are
//    defined.  Pseudo-header fields defined for requests MUST NOT appear
//    in responses; pseudo-header fields defined for responses MUST NOT
//    appear in requests.  Pseudo-header fields MUST NOT appear in
//    trailers.  Endpoints MUST treat a request or response that contains
//    undefined or invalid pseudo-header fields as malformed
//    (Section 8.1.2.6).

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {
    fheaders[':status'] = '200';
    return fheaders;

  });

};

