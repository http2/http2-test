module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    fheaders['xxxx'] = 'ZZZZZZ';
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    return headerBuf.slice(0, headerBuf.length - 2); // truncate 2 chars from end which is part of the last value
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};
