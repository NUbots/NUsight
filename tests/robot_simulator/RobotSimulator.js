var ProtoBuf = require('protobufjs');
var zmq = require('zmq');

function RobotSimulator () {
	this.port = 14000;
	this.socket = zmq.socket('pub');
	this.socket.bindSync('tcp://0.0.0.0:' + this.port);
	this.builder = ProtoBuf.loadProtoFile({
		root: '../../public/resources/js/proto',
		file: 'messages/support/nubugger/proto/Message.proto'
	});
	this.API = this.builder.build('messages.support.nubugger.proto');
	this.API.Overview = this.builder.build('messages.support.nubugger.proto.Overview');
	this.API.Behaviour = this.builder.build('messages.behaviour.proto.Behaviour');
	this.API.GameState = this.builder.build('messages.input.proto.GameState');
	this.API.Configuration = this.builder.build('messages.support.nubugger.proto.ConfigurationState');
	this.API.GameState = this.builder.build('messages.input.proto.GameState');
	this.API.Image = this.builder.build('messages.input.proto.Image');
	this.API.Sensors = this.builder.build('messages.input.proto.Sensors');
	this.API.Subsumption = this.builder.build('messages.behaviour.proto.Subsumption');
	this.API.Vision = this.builder.build('messages.vision.proto');
	this.API.LookUpTableDiff = this.builder.build('messages.vision.proto.LookUpTableDiff');
	this.API.SensorData = this.builder.build('messages.input.proto.Sensors');
	this.API.VisionObject = this.builder.build('messages.vision.proto.VisionObject');
	this.API.DrawObjects = this.builder.build('messages.support.nubugger.proto.DrawObjects');
}

RobotSimulator.prototype.randFloat =  function (min, max) {
	return Math.random() * (max - min) + min;
};

RobotSimulator.prototype.randUnitVector = function () {
	var angle = Math.random() * 2 * Math.PI;
	return {
		x: Math.cos(angle),
		y: Math.sin(angle)
	}
};

RobotSimulator.prototype.randVec2 = function (scaleX, scaleY) {
	return {
		x: Math.random() * (scaleX || 1),
		y: Math.random() * (scaleY || scaleX || 1)
	};
};

RobotSimulator.prototype.randomFieldPosition = function () {
	var fieldLength = 9;
	var fieldWidth = 6;
	return {
		x: Math.random() * fieldLength - (fieldLength * 0.5),
		y: Math.random() * fieldWidth - (fieldWidth * 0.5)
	};
};

RobotSimulator.prototype.randInt = function (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
};

RobotSimulator.prototype.randColor = function () {
	return {
		x: Math.random(),
		y: Math.random(),
		z: Math.random(),
		t: Math.random()
	};
};

RobotSimulator.prototype.getLUTIndex = function (ycbcr, bitsY, bitsCb, bitsCr) {
	bitsY = bitsY || 6;
	bitsCb = bitsCb || 6;
	bitsCr = bitsCr || 6;
	var bitsRemovedY = 8 - bitsY;
	var bitsRemovedCb = 8 - bitsCb;
	var bitsRemovedCr = 8 - bitsCr;

	var index = 0;
	index |= Math.floor(ycbcr[0]) >> bitsRemovedY;
	index <<= bitsCb;
	index |= Math.floor(ycbcr[1]) >> bitsRemovedCb;
	index <<= bitsCr;
	index |= Math.floor(ycbcr[2]) >> bitsRemovedCr;

	return index;
};

RobotSimulator.prototype.sendMessage = function (message) {
	var buffer = message.toBuffer();
	var finalBuffer = new Buffer(buffer.length + 2);
	finalBuffer.writeUInt8(message.getType(), 0);
	finalBuffer.writeUInt8(message.getFilterId(), 1);
	buffer.copy(finalBuffer, 2);
	this.socket.send(finalBuffer);
};

RobotSimulator.prototype.run = function () {};

RobotSimulator.prototype.runEvery = function (period) {
	this.intervalId = setInterval(this.run.bind(this), period);
};

RobotSimulator.prototype.cancelRunEvery = function (period) {
	if (this.intervalId) {
		clearInterval(this.intervalId);
	}
};

module.exports = RobotSimulator;
