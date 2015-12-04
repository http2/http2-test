// RFC 7540, Section 6.5.1
//       Receipt of a SETTINGS frame with the ACK flag set and a length
//       field value other than 0 MUST be treated as a connection error
//       (Section 5.4.1) of type FRAME_SIZE_ERROR.  For more information,
//       see Section 6.5.3 ("Settings Synchronization").

module.exports = function(host, port, log, callback, sframes, errorType) {

  var sframes = [{
    type: 'SETTINGS',
    flags: {'ACK': true},
    settings: {'SETTINGS_ENABLE_PUSH': 0},
    stream: 0,
  }];

  require('./expect-error')(host, port, log, callback, sframes, 'FRAME_SIZE_ERROR');
};
