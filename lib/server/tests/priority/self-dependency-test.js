// RFC 7450, Section 5.3.1
//    A stream cannot depend on itself.  An endpoint MUST treat this as a
//    stream error (Section 5.4.2) of type PROTOCOL_ERROR.

module.exports = function(host, port, log, callback) {

  var pframe = {
    type: 'PRIORITY',
    stream: 1,
    flags: {},
    priorityDependency: 1,
    priorityWeight: 128,
    exclusiveDependency: false,
  };

  require('./expect-error')(host, port, log, callback, pframe, 'PROTOCOL_ERROR');
};
