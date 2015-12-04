module.exports = function(host, port, log, callback) {


  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Literal Header Field with Incremental Indexing -- New Name
    // Header is   'x' (length of value is very very large but actual value is not present)
    return Buffer.concat([headerBuf, new Buffer([64,1,120,127,255,255,255,255,255,255,255,255,255,255,127])]);
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
