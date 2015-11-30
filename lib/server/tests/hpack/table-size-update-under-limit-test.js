module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // update table size to 4095 as default it 4096
    // encode_integer(4095, 5-bit-prefix) = 0x1fe01f
    // with table udpate code = 0x3fe01f
    return Buffer.concat([headerBuf, new Buffer([0x3f, 0xe0, 0x1f])]);
  };

  require('./expect-no-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
