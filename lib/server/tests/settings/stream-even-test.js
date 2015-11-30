// RFC 7540, Section 6.5
//    SETTINGS frames always apply to a connection, never a single stream.
//    The stream identifier for a SETTINGS frame MUST be zero (0x0).  If an
//    endpoint receives a SETTINGS frame whose stream identifier field is
//    anything other than 0x0, the endpoint MUST respond with a connection
//    error (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback, sframes, errorType) {

  var sframes = [{
    type: 'SETTINGS',
    settings: [],
    stream: 2,
  }];

  require('./expect-error')(host, port, log, callback, sframes);
};
