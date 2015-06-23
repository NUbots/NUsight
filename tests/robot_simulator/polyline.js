var ProtoBuf = require('protobufjs');
var zmq = require('zmq');

var builder = ProtoBuf.loadProtoFile({
	root: '../../public/resources/js/proto',
	file: 'messages/support/nubugger/proto/Message.proto'
});

var API = builder.build('messages.support.nubugger.proto');
API.DrawObjects = builder.build('messages.support.nubugger.proto.DrawObjects');

var type = API.Message.Type.DRAW_OBJECTS;
var filterId = 0;

var socket = zmq.socket('pub');
socket.bindSync('tcp://0.0.0.0:12000');

var getRandomPosition = function () {
	return {
		x: Math.random() * 5,
		y: Math.random() * 5
	};
};

setInterval(function () {
	var now = Date.now() / 1000;

	var message = new API.Message({
		type: type,
		filter_id: filterId,
		utc_timestamp: Date.now(),
		draw_objects: {
			objects: [{
				shape: 'POLYLINE',
				path: [{
					position: getRandomPosition(),
					parentIndex: 0
				}, {
					position: getRandomPosition(),
					parentIndex: 0
				}, {
					position: getRandomPosition(),
					parentIndex: 0
				}, {
					position: getRandomPosition(),
					parentIndex: 2
				}, {
					position: getRandomPosition(),
					parentIndex: 0
				}]
			}]
		}
	});

	var buffer = message.toBuffer();
	var finalBuffer = new Buffer(buffer.length + 2);
	finalBuffer.writeUInt8(type, 0);
	finalBuffer.writeUInt8(filterId, 1);
	buffer.copy(finalBuffer, 2);
	socket.send(finalBuffer);

}, 5000);