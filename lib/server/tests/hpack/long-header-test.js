module.exports = function(host, port, log, callback) {

  function processHeaders(fheaders) {
    fheaders['x'] = Array(250000).join("Z");
    return fheaders;
  };

  require('./expect-error')(host, port, log, callback, processHeaders, undefined, 'INTERNAL_ERROR');

};


