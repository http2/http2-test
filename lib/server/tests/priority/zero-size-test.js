// RFC 7540, Section 6.3
//
//   A PRIORITY frame with a length other than 5 octets MUST be treated as
//   a stream error (Section 5.4.2) of type FRAME_SIZE_ERROR.

module.exports = function(host, port, log, callback) {

  // length=3B, type=1B, flags=1B, stream=4B
  var fb = new Buffer([0x00,0x00,0x00, 0x02, 0x00, 0x00,0x00,0x00,0x01]);

  require('./expect-error')(host, port, log, callback, fb);

};
