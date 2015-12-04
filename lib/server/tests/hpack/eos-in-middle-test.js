module.exports = function(host, port, log, callback) {


  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Literal Header Field with Incremental Indexing -- New Name
    // Only the value is Huffman encoded
    // Header is   'x: XEOS?'  // 'X' is 8 bits, EOS is 30 bits and '?' is 10 bits for a total of 6 bytes
    return Buffer.concat([headerBuf, new Buffer([0x40,   0x01,0x78,   0x86,0xfc,0xff,0xff,0xff,0xff,0xfc])]);  // 'X', EOS and '?' char are at end
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
