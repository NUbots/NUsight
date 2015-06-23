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

var HEADER_SIZE = 4;
var loop = true;
var speed = 1; // 1 is normal, 2 is double speed, 0.5 is half speed

(function readFile() {

	var lastTimestamp = null;
	fs.open(file, 'r', function (err, fd) {

		(function readMessage() {

			// Read the header into a buffer, containing the size of the data packet
			fs.read(fd, new Buffer(HEADER_SIZE), 0, HEADER_SIZE, null, function (err, bytesRead, header) {

				if (err || bytesRead === 0) {
					// End of file
					if (loop) {
						// Start from beginning of file again
						readFile();
					}
					return;
				}
				// Read the length of the data packet
				var dataLength = header.readUInt32LE(0);
				fs.read(fd, new Buffer(dataLength), 0, dataLength, null, function (err, bytesRead, data) {

					// Decode protobuf to get the type/filterId and update the timestamp
					var message = API.Message.decode(data);
					var type = message.getType();
					var filterId = message.getFilterId();
					var timestamp = message.getUtcTimestamp().toNumber();
					var deltaTimestamp = lastTimestamp === null ? 0 : timestamp - lastTimestamp;

					// Delay sending of message until the deltaTimestamp has occurred (scaled by speed) to simulate proper timings
					setTimeout(function () {

						// Override timestamp
						message.setUtcTimestamp(Date.now());
						// Re-encode protobuf with prepended headers
						var buffer = message.toBuffer();
						var finalBuffer = new Buffer(buffer.length + 2);
						finalBuffer.writeUInt8(type, 0);
						finalBuffer.writeUInt8(filterId, 1);
						buffer.copy(finalBuffer, 2);
						//console.log('Sending message of type ' + type + ' (len: ' + finalBuffer.length + ')');
						socket.send(finalBuffer);

						// Read next message in file
						readMessage();

					}, deltaTimestamp / speed);

					lastTimestamp = timestamp;

				});

			});

		}());

	});

}());
