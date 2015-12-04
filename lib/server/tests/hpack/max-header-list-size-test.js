module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    fheaders['x'] = Array(262144 - 45).join("Z"); // about 256KB
    return fheaders;
  };

  require('./expect-error')(host, port, log, callback, processHeaders);

};

