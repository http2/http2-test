module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    fheaders['xxxx'] = Array(261).join("Z"); // 260 chars
    return fheaders;
  };

  function mungeHeaders(headerBuf) {
    return headerBuf.slice(0, headerBuf.length - (260 + 1)); // truncate the entire value and 2 chars of length field
  };

  require('./expect-error')(host, port, log, callback, processHeaders, mungeHeaders);

};

