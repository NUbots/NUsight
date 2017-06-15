var ProtoBuf = require('protobufjs');
var NUClearNet = require('nuclearnet.js').NUClearNet;
var ref = require('ref');
var path = require('path');

function RobotSimulator (opts) {
	opts = opts || {};
	this.net = opts.net || new NUClearNet();
	this.net.connect({
		name: this.constructor.name,
	});
	this.protoBuilder = opts.protoBuilder || ProtoBuf.newBuilder({ convertFieldsToCamelCase: true });

	// A map of message types to callback functions which will be called
	// when a message of the type is received
	this.listenerCallbacks = {};

	// Holds the proto messages that have been loaded, to be used
	// for decoding messages
	this.protos = {};
}

RobotSimulator.prototype.loadProto = function (protocolBuffer) {
	// Return the proto message if it has already been loaded
	if (this.protos[protocolBuffer]) {
		return this.protos[protocolBuffer];
	}

	// Load the protocol buffer file and build it
	ProtoBuf.loadProtoFile({
		root: path.join(__dirname, '../../public/resources/js/proto'),
		file: protocolBuffer.replace(/\./g, '/') + '.proto'
	}, this.protoBuilder);

	var proto = this.protoBuilder.build(protocolBuffer);

	// Update our API
	this.API = this.protoBuilder.build();

	// Store the loaded proto message, which will be used for decoding
	this.protos[protocolBuffer] = proto;

	return proto;
};

RobotSimulator.prototype.decodeProto = function (messageType, data) {
	try {
		return this.protos[messageType].decode(data);
	} catch (error) {
		console.error('Error decoding the proto message', messageType, '\n', error);

		// Quit the process, as this is considered a fatal error
		process.exit();
	}
};

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
	this.net.send({
		type: messageType,
		payload: Buffer.concat([header, message.toBuffer()]),
		target: 'nusight',
		'reliable': reliable,
	});
};

RobotSimulator.prototype.onMessage = function (messageType, callback) {
	var callbacks = Array.isArray(this.listenerCallbacks[messageType]) ? this.listenerCallbacks[messageType] : [];
	var isFirstListener = callbacks.length === 0;

	callbacks.push(callback);
	this.listenerCallbacks[messageType] = callbacks;

	if (isFirstListener) {
		this.net.on('NUsight<' + messageType + '>', function (packet) {
			var source = packet.peer.name;
			var data = packet.payload;

			var decodedMessage = this.decodeProto(messageType, data);

			this.listenerCallbacks[messageType].forEach(function (callback) {
				callback(decodedMessage);
			});
		}.bind(this));
	}
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
