// RFC 7541, Section 6.3
//    The new maximum size MUST be lower than or equal to the limit
//    determined by the protocol using HPACK.  A value that exceeds this
//    limit MUST be treated as a decoding error.

module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // update table size to 4097 as default it 4096
    // encode_integer(4097, 5-bit-prefix) = 0x1fe21f
    // with table udpate code = 0x3fe21f
    return Buffer.concat([headerBuf, new Buffer([0x3f, 0xe2, 0x1f])]);
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
