var ProtoBuf = require('protobufjs');
var zmq = require('zmq');

var builder = ProtoBuf.loadProtoFile({
	root: '../../public/resources/js/proto',
	file: 'messages/support/nubugger/proto/Message.proto'
});

var API = builder.build('messages.support.nubugger.proto');
API.SensorData = builder.build('messages.input.proto.Sensors');

var type = API.Message.Type.SENSOR_DATA;
var filterId = 0;

var socket = zmq.socket('pub');
socket.bindSync('tcp://0.0.0.0:14000');

setInterval(function () {

	var message = new API.Message({
		type: type,
		filter_id: filterId,
		utc_timestamp: Date.now(),
		sensor_data: {
			timestamp: new Date().getMilliseconds(),
			voltage: 12,
			battery: Math.random()
		}
	});

	var buffer = message.toBuffer();
	var finalBuffer = new Buffer(buffer.length + 2);
	finalBuffer.writeUInt8(type, 0);
	finalBuffer.writeUInt8(filterId, 1);
	buffer.copy(finalBuffer, 2);
	socket.send(finalBuffer);

}, 5000);