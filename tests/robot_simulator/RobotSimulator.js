var ProtoBuf = require('protobufjs');
var NUClearNet = require('nuclearnet.js');
var ref = require('ref');

function RobotSimulator () {
	this.net = new NUClearNet(this.constructor.name, '239.226.152.162', 7447);
	this.protoBuilder = ProtoBuf.newBuilder({ convertFieldsToCamelCase: true });
}

RobotSimulator.prototype.loadProto = function (protocolBuffer) {
	// Load the protocol buffer file and build it
	ProtoBuf.loadProtoFile({
		root: '../../public/resources/js/proto',
		file: protocolBuffer.replace(/\./g, '/') + '.proto'
	}, this.protoBuilder);

	var proto = this.protoBuilder.build(protocolBuffer);

	// Update our API
	this.API = this.protoBuilder.build();

	return proto;
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

RobotSimulator.prototype.sendMessage = function (message, reliable) {

	// Our message type
	var messageType = 'NUsight<' + message.$type.toString().substr(1) + '>';

	// Make our buffer for our metadata
	var header = new Buffer(9);
	header.writeUInt8(0, 0);
	header.writeUInt64LE(Date.now(), 1)

	this.net.send(messageType, Buffer.concat([header, message.toBuffer()]), 'nusight', reliable);
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
