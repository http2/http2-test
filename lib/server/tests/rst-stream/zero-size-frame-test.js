// RFC 7540, Section 6.4
//    A RST_STREAM frame with a length other than 4 octets MUST be treated
//    as a connection error (Section 5.4.1) of type FRAME_SIZE_ERROR.

module.exports = function(host, port, log, callback) {

  // length=3B, type=1B, flags=1B, stream=4B   error_code=4B
  var fb = new Buffer([0x00,0x00,0x00, 0x03, 0x00, 0x00,0x00,0x00,0x01]);

  require('./expect-error')(host, port, log, callback, fb, 'FRAME_SIZE_ERROR');
};
