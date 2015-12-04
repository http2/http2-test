// RFC 7540, Section 6.5.2
//       Values above the maximum flow-control window size of 2^31-1 MUST
//       be treated as a connection error (Section 5.4.1) of type
//       FLOW_CONTROL_ERROR.

module.exports = function(host, port, log, callback, sframes, errorType) {

  var sframes = [{
    type: 'SETTINGS',
    settings: {'SETTINGS_INITIAL_WINDOW_SIZE': (Math.pow(2, 32) - 1)},
    stream: 0,
  }];

  require('./expect-error')(host, port, log, callback, sframes, 'FLOW_CONTROL_ERROR');
};
