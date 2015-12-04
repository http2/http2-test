module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    // Using   Literal Header Field with Incremental Indexing -- New Name
    // Header name is 'x' (zero length value)
    return Buffer.concat([headerBuf, new Buffer([64,1,120,127,0])]);
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
