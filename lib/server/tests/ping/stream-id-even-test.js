// RFC 7540, Section 6.7 PING
//    PING frames are not associated with any individual stream.  If a PING
//    frame is received with a stream identifier field value other than
//    0x0, the recipient MUST respond with a connection error
//    (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var pingFrame = {
    type: 'PING',
    stream: 2,
    flags: { ACK: false },
    data: new Buffer('0102030405060708', 'hex'),
  };

  require('./expect-error')(host, port, log, callback, pingFrame, 'PROTOCOL_ERROR');
};
