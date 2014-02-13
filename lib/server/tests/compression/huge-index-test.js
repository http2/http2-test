// > [4.3. Header Compression and Decompression](http://tools.ietf.org/html/draft-ietf-httpbis-http2-06#section-4.3)
// >
// > ...
// >
// > A receiver MUST terminate the connection with a connection
// > error (Section 5.4.1) of type COMPRESSION_ERROR, if it does not
// > decompress a header block.
//
// This test sends a header block with a single header representation with substitution indexing.
// The index is so large that it does not fit into 64 bits, so it may trigger an overflow or other
// errors in a naive implementation which may load to a crash.
//
// The encoded index is invalid since there's no item in the Header Table with that large index, so
// the peer should shut down the connection with COMPRESSION_ERROR. If the peer cannot decode the
// index, but handles this situation gracefully, it should return COMPRESSION_ERROR, too

var invalidDataTestCase = require('./invalid-data');
module.exports = function(host, port, log, callback) {
  // representations = [{ name: 'x', value: 'y', index: largeNumber }];
  var largeNumber = 'ffffffffffffffffffff00'; // 2^70 - 1 = 1180591620717411303423
  var representation = new Buffer('00' + '0178' + largeNumber + '0179', 'hex');
  invalidDataTestCase(host, port, log, callback, representation);
};
