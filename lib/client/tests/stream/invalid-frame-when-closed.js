// > [5.1. Stream States](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-5.1)
// >
// > ...
// >
// > The **closed** state is the terminal state.
// >
// > * An endpoint MUST NOT send frames on a closed stream. An endpoint that receives a frame
// >   after receiving a RST_STREAM or a frame containing a END_STREAM flag on that stream MUST
// >   treat that as a stream error of type STREAM_CLOSED.
// > * WINDOW_UPDATE, PRIORITY or RST_STREAM frames can be received in this state for a short
// >   period after a frame containing an END_STREAM flag is sent.  Until the remote peer receives
// >   and processes the frame bearing the END_STREAM flag, it might send either frame type.
// >   Endpoints MUST ignore WINDOW_UPDATE frames received in this state, though endpoints MAY
// >   choose to treat WINDOW_UPDATE frames that arrive a significant time after sending
// >   END_STREAM as a connection error of type PROTOCOL_ERROR.
// > * If this state is reached as a result of sending a RST_STREAM frame, the peer that receives
// >   the RST_STREAM might have already sent - or enqueued for sending - frames on the stream
// >   that cannot be withdrawn. An endpoint that sends a RST_STREAM frame MUST ignore frames that
// >   it receives on closed streams after it has sent a RST_STREAM frame. An endpoint MAY choose
// >   to limit the period over which it ignores frames and treat frames that arrive after this
// >   time as being in error.
// > * An endpoint might receive a PUSH_PROMISE frame after it sends RST_STREAM. PUSH_PROMISE
// >   causes a stream to become "reserved". If promised streams are not desired, a RST_STREAM
// >   can be used to close any of those streams.
// >
// > ...
// >
// > In the absence of more specific guidance elsewhere in this document, implementations SHOULD
// > treat the receipt of a message that is not expressly permitted in the description of a state
// > as a connection error (Section 5.4.1) of type PROTOCOL_ERROR.
//
// This family of tests opens a push stream, closes it, and then sends invalid frames on the closed
// stream. If we would simply send a response to the request, and then send invalid frames, there's
// a race: the client may close the connection before receiving the invalid frame.

var http2 = require('http2-protocol');

module.exports = function(socket, log, callback, generateInvalidFrame, desiredError) {
  var endpoint = new http2.Endpoint(log, 'SERVER', {}, {
    beforeCompression: beforeCompression
  });
  socket.pipe(endpoint).pipe(socket);
  var originalStream;
  endpoint.on('stream', function(stream) {
    originalStream = stream;
    stream.headers({
      ':status': 200
    });
    var push = stream.promise({
      ':method': 'GET',
      ':scheme': 'http',
      ':authority': 'localhost',
      ':path': 'promised-resource'
    });
    push.headers({
      ':status': 200
    });
    push.end('Pushed content');
  });

  function beforeCompression(frame, forward, done) {
    forward(frame);
    if (frame.flags.END_STREAM) {
      forward(generateInvalidFrame(frame.stream, originalStream.id));
    }
    done();
  }

  desiredError = desiredError || 'STREAM_CLOSED';
  endpoint.on('peerError', function(error) {
    if (error === desiredError) {
      callback();
    } else {
      callback('Not appropriate error code: ' + error);
    }
  });
};