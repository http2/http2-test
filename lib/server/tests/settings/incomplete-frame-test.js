// RFC 7540, Section 6.5
//    A SETTINGS frame with a length other than a multiple of 6 octets MUST
//    be treated as a connection error (Section 5.4.1) of type
//    FRAME_SIZE_ERROR.

module.exports = function(host, port, log, callback, sframes, errorType) {

  // setting has the id but not the value
  //                   length,         type, flags, stream,              id,        value
  var fb = new Buffer([0x00,0x00,0x05, 0x04, 0x00,  0x00,0x00,0x00,0x00, 0x00,0x02, 0x00,0x00,0x00]);

  // we should not get a HEADERS frame
  require('./expect-error')(host, port, log, callback, fb, 'FRAME_SIZE_ERROR');
};
