// RFC 7540, Section 5.1
//    idle:
//       All streams start in the "idle" state.
//
//       The following transitions are valid from this state:
//
//       *  Sending or receiving a HEADERS frame causes the stream to
//          become "open".  The stream identifier is selected as described
//          in Section 5.1.1.  The same HEADERS frame can also cause a
//          stream to immediately become "half-closed".
//
//       *  Sending a PUSH_PROMISE frame on another stream reserves the
//          idle stream that is identified for later use.  The stream state
//          for the reserved stream transitions to "reserved (local)".
//
//       *  Receiving a PUSH_PROMISE frame on another stream reserves an
//          idle stream that is identified for later use.  The stream state
//          for the reserved stream transitions to "reserved (remote)".
//
//       *  Note that the PUSH_PROMISE frame is not sent on the idle stream
//          but references the newly reserved stream in the Promised Stream
//          ID field.
//
//       Receiving any frame other than HEADERS or PRIORITY on a stream in
//       this state MUST be treated as a connection error (Section 5.4.1)
//       of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var iframes = [{
    type: 'WINDOW_UPDATE',
    window_size: 1,
    stream: 2,
  }];

  require('./expect-error')(host, port, log, callback, iframes);
};
