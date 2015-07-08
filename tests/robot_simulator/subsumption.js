var ProtoBuf = require('protobufjs');
var zmq = require('zmq');

var builder = ProtoBuf.loadProtoFile({
	root: '../../public/resources/js/proto',
	file: 'messages/support/nubugger/proto/Message.proto'
});

var API = builder.build('messages.support.nubugger.proto');
API.Subsumption = builder.build('messages.behaviour.proto.Subsumption');

var type = API.Message.Type.SUBSUMPTION;
var filterId = 0;

var socket = zmq.socket('pub');
socket.bindSync('tcp://0.0.0.0:14000');

setInterval(function () {

	var message = new API.Message({
		type: type,
		filter_id: filterId,
		utc_timestamp: Date.now(),
		subsumption: {
			type: 1,
			action_register: {
				id: Math.floor(Math.random()) + 1,
				name: 'some name',
				limb_set: [{
					priority: Math.floor(Math.random() * 10) + 1,
					limbs: Math.floor(Math.random() * 5) + 1
				}]
			}
			//action_state_change: {
			//	state: 1,
			//	name: 'name',
			//	limbs: Math.floor(Math.random() * 5) + 1
			//}
		}
	});

	var buffer = message.toBuffer();
	var finalBuffer = new Buffer(buffer.length + 2);
	finalBuffer.writeUInt8(type, 0);
	finalBuffer.writeUInt8(filterId, 1);
	buffer.copy(finalBuffer, 2);
	socket.send(finalBuffer);

}, 5000);
