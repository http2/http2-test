module.exports = function(host, port, log, callback) {


  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Literal Header Field with Incremental Indexing -- New Name
    // Only the value is Huffman encoded
    // Header is  'x: ?EOS'  // EOS is 30 bits and '?' is 10 bits for a total of 5 bytes
    return Buffer.concat([headerBuf, new Buffer([0x40,   0x01,0x78,   0x85,0xff,0x3f,0xff,0xff,0xff])]);  // '?' and EOS char are at end
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
