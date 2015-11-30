module.exports = function(host, port, log, callback) {


  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Literal Header Field with Incremental Indexing -- New Name
    // Header is   'x' (zero length value but represented in a bad way)
    return Buffer.concat([headerBuf, new Buffer([64,1,120,127,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,0])]);
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};

