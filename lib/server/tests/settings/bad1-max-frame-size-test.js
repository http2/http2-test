// RFC 7540, Section 6.5.2
//       The initial value is 2^14 (16,384) octets.  The value advertised
//       by an endpoint MUST be between this initial value and the maximum
//       allowed frame size (2^24-1 or 16,777,215 octets), inclusive.
//       Values outside this range MUST be treated as a connection error
//       (Section 5.4.1) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback, sframes, errorType) {

  var sframes = [{
    type: 'SETTINGS',
    settings: {'SETTINGS_MAX_FRAME_SIZE': (Math.pow(2, 14) - 1)},
    stream: 0,
  }];

  require('./expect-error')(host, port, log, callback, sframes);
};
