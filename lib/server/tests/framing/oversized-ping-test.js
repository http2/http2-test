var http2 = require('http2-protocol'),
    net = require('net');

module.exports = function(host, port, log, callback) {
  var socket = net.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);

  endpoint._serializer.write({
    type: 'PING',
    flags: {},
    stream: 0,
    data: new Buffer(10)
  });

  endpoint.on('peerError', function(error) {
    if (error === 'PROTOCOL_ERROR') {
      log.info('Received Error: ' + error);
      callback();
    } else {
      callback('Inappropriate error code: ' + error);
    }
  });

};
