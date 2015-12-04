// RFC 7450, Section 8.1.2.1
//    All pseudo-header fields MUST appear in the header block before
//    regular header fields.  Any request or response that contains a
//    pseudo-header field that appears in a header block after a regular
//    header field MUST be treated as malformed (Section 8.1.2.6).

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {

    var m = fheaders[':method'];
    delete fheaders[':method'];

    // convert headers to array
    var harray = [];
    for (var h in fheaders) {
      harray.push([h, fheaders[h]]);
    }
    harray.push(['regularheader', 'some value']);
    harray.push([':method', m]);

    return harray;
  });

};
