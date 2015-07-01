var ProtoBuf = require('protobufjs');
var zmq = require('zmq');

var builder = ProtoBuf.loadProtoFile({
	root: '../../public/resources/js/proto',
	file: 'messages/support/nubugger/proto/Message.proto'
});

var API = builder.build('messages.support.nubugger.proto');
API.VisionObject = builder.build('messages.vision.proto.VisionObject');

var type = API.Message.Type.VISION_OBJECT;
var filterId = 0;

var socket = zmq.socket('pub');
socket.bindSync('tcp://0.0.0.0:14000');

function randFloat(min, max) {
	return Math.random() * (max - min) + min;
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function randColor() {
	return {
		x: Math.random(),
		y: Math.random(),
		z: Math.random(),
		t: Math.random()
	};
}

setInterval(function () {
	var now = Date.now();

	var lines = [];

	var n = Math.floor(10 * Math.random() + 1);
	var width = 320;
	var height = 240;
	for (var i = 0; i < n; i++) {
		lines.push({
			start: {x: randInt(0, width), y: randInt(0, height)},
			end: {x: randInt(0, width), y: randInt(0, height)},
			colour: randColor()
		});
	}

	var message = new API.Message({
		type: type,
		filter_id: filterId,
		utc_timestamp: now,
		vision_object: {
			camera_id: 0,
			type: API.VisionObject.ObjectType.LINE,
			line: lines
		}
	});

	var buffer = message.toBuffer();
	var finalBuffer = new Buffer(buffer.length + 2);
	finalBuffer.writeUInt8(type, 0);
	finalBuffer.writeUInt8(filterId, 1);
	buffer.copy(finalBuffer, 2);
	socket.send(finalBuffer);

}, 100);

