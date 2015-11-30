// RFC 7540, Section 6.9.1
//    A sender MUST NOT allow a flow-control window to exceed 2^31-1
//    octets.  If a sender receives a WINDOW_UPDATE that causes a flow-
//    control window to exceed this maximum, it MUST terminate either the
//    stream or the connection, as appropriate.  For streams, the sender
//    sends a RST_STREAM with an error code of FLOW_CONTROL_ERROR; for the
//    connection, a GOAWAY frame with an error code of FLOW_CONTROL_ERROR
//    is sent.

module.exports = function(host, port, log, callback) {

  var iframes = [{
    type: 'WINDOW_UPDATE',
    window_size: Math.pow(2, 31) - 1,
    stream: 0,
  }];

  require('./expect-error')(host, port, log, callback, iframes, 'FLOW_CONTROL_ERROR', 'GOAWAY');
};
