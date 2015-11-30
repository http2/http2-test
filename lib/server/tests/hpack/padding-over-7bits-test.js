// RFC 7541, Section 5.2
//    Upon decoding, an incomplete code at the end of the encoded data is
//    to be considered as padding and discarded.  A padding strictly longer
//    than 7 bits MUST be treated as a decoding error.

module.exports = function(host, port, log, callback) {


  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Literal Header Field with Incremental Indexing -- New Name
    // Only the value is Huffman encoded
    // Header is   'x: 0'
    return Buffer.concat([headerBuf, new Buffer([64,1,120,129,7,255])]);  // last 255 makes it padding over 7 bits
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};

