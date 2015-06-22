var ProtoBuf = require('protobufjs');
var fs = require('fs');
var zmq = require('zmq');

var builder = ProtoBuf.loadProtoFile({
	root: 'public/resources/js/proto',
	file: 'messages/support/nubugger/proto/Message.proto'
});
var API = builder.build('messages.support.nubugger.proto');

var file = 'logs/10.1.2.3/1434957219766.nbs';

var socket = zmq.socket('pub');
socket.bindSync('tcp://0.0.0.0:12000');

var loop = true;
var speed = 1; // 1 is normal, 2 is double speed, 0.5 is half speed

(function readFile() {

	var lastTimestamp = null;
	fs.open(file, 'r', function (err, fd) {

		(function readMessage() {

			fs.read(fd, new Buffer(4), 0, 4, null, function (err, bytesRead, header) {

				if (err || bytesRead === 0) {
					if (loop) {
						readFile();
					}
					return;
				}
				var length = header.readUInt32LE(0);
				fs.read(fd, new Buffer(length), 0, length, null, function (err, bytesRead, data) {

					var message = API.Message.decode(data);
					var type = message.getType();
					var filterId = message.getFilterId();
					var timestamp = message.getUtcTimestamp().toNumber();
					var deltaTimestamp = lastTimestamp === null ? 0 : timestamp - lastTimestamp;

					setTimeout(function () {

						message.setUtcTimestamp(Date.now()); // override timestamp
						var buffer = message.toBuffer();
						var finalBuffer = new Buffer(buffer.length + 2);
						finalBuffer.writeUInt8(type, 0);
						finalBuffer.writeUInt8(filterId, 1);
						buffer.copy(finalBuffer, 2);
						//console.log('Sending message of type ' + type + ' (len: ' + finalBuffer.length + ')');
						socket.send(finalBuffer);

						readMessage();

					}, deltaTimestamp / speed);

					lastTimestamp = timestamp;

				});

			});

		}());

	});

}());
