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
					position: {x: 1, y: 1},
					parentIndex: 0
				}, {
					position: {x: 1.5, y: 3},
					parentIndex: 0
				}, {
					position: {x: 5, y: 2},
					parentIndex: 0
				}, {
					position: {x: 0, y: -2},
					parentIndex: 2
				}, {
					position: {x: 0, y: -1},
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

}, 50);