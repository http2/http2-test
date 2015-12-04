// RFC 7540, Section 6.9
//    A WINDOW_UPDATE frame with a length other than 4 octets MUST be
//    treated as a connection error (Section 5.4.1) of type
//    FRAME_SIZE_ERROR.

module.exports = function(host, port, log, callback) {

  // setting has the id but not the value
  //                   length,         type, flags, stream,              window_size
  var fb = new Buffer([0x00,0x00,0x00, 0x08, 0x00,  0x00,0x00,0x00,0x03, ]);

  require('./expect-error')(host, port, log, callback, fb, 'FRAME_SIZE_ERROR');
};
