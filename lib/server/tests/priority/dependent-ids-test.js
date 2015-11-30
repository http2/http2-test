// RFC 7540, Section 6.3
//    The PRIORITY frame can be sent on a stream in any state, though it
//    cannot be sent between consecutive frames that comprise a single
//    header block (Section 4.3).

module.exports = function(host, port, log, callback) {

  var pframes = [{
    type: 'PRIORITY',
    stream: 5,
    priorityDependency: 0, // 0
    priorityWeight: 0, // min weight
    exclusiveDependency: false,
  },{
    type: 'PRIORITY',
    stream: 5,
    priorityDependency: 1, // closed since we start at 5
    priorityWeight: 255, // max weight
    exclusiveDependency: false,
  },{
    type: 'PRIORITY',
    stream: 5,
    priorityDependency: 11, // idle
    priorityWeight: 128,
    exclusiveDependency: false,
  },{
    type: 'PRIORITY',
    stream: 5,
    priorityDependency: 2,  // even
    priorityWeight: 128,
    exclusiveDependency: false,
    flags: {
      RESERVED1: true,
      RESERVED2: true,
      RESERVED3: true,
      RESERVED4: true,
      RESERVED5: true,
      RESERVED6: true,
      RESERVED7: true,
      RESERVED8: true,
    },
  }];

  require('./expect-no-error')(host, port, log, callback, pframes);

};
