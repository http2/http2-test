// RFC 7540, Section 6.7 PING
//    Receipt of a PING frame with a length field value other than 8 MUST
//    be treated as a connection error (Section 5.4.1) of type
//    FRAME_SIZE_ERROR.

module.exports = function(host, port, log, callback) {

  var pingFrame = {
    type: 'PING',
    stream: 0,
    flags: { ACK: false },
    data: new Buffer('', 'hex'),
  };

  require('./expect-error')(host, port, log, callback, pingFrame);

};
