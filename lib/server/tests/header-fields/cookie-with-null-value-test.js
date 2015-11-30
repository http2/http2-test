// RFC 7450, Section 10.3
//    While most of the values that can be encoded will not alter header
//    field parsing, carriage return (CR, ASCII 0xd), line feed (LF, ASCII
//    0xa), and the zero character (NUL, ASCII 0x0) might be exploited by
//    an attacker if they are translated verbatim.  Any request or response
//    that contains a character not permitted in a header field value MUST
//    be treated as malformed (Section 8.1.2.6).

module.exports = function(host, port, log, callback) {

  require('./expect-rststream')(host, port, log, callback, function(fheaders) {
    fheaders['cookie'] = 'a=\00y';
    return fheaders;
  });

};
