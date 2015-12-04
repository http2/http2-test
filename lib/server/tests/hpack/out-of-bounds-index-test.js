// RFC 7541, Section 2.3.3
//    Indices strictly greater than the sum of the lengths of both tables
//    MUST be treated as a decoding error.

module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Indexed Header Field Representation
    // Referencing index 126
    return Buffer.concat([headerBuf, new Buffer([0xfe])]); // 0xFE =  1111 1110
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};

