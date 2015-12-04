// RFC 7540, Section 6.7 PING
//    In addition to the frame header, PING frames MUST contain 8 octets of
//    opaque data in the payload.  A sender can include any value it
//    chooses and use those octets in any fashion.

module.exports = function(host, port, log, callback) {

  require('./ping-test')(host, port, log, callback, new Buffer('0000000000000000', 'hex'));

};
