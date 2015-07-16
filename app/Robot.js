var net, util, events, zmq, dgram;

net = require('net');
util = require('util');
events = require('events');
zmq = require('zmq');
fs = require('fs');
dgram = require('dgram');

function Robot (id, host, port, name) {

	if (port === undefined) {
		port = 12000;
	}

	this.id = id;
	this.host = host;
	this.port = port;
	this.name = name;
	this.enabled = true;
	// Robot to Node
	this.sub = null;
	// Node to Robot
	this.pub = null;

	this.recording = false;
	this.recordingFile = null;
}

util.inherits(Robot, events.EventEmitter);

Robot.prototype.connect = function () {

	if (this.enabled) {
		this.sub = zmq.socket('sub');
		this.sub.connect('tcp://' + this.host + ':' + this.port);
		console.log('Connecting to robot on tcp://' + this.host + ':' + this.port);
		this.sub.subscribe("");

		this.sub.on('message', function () {

			this.onMessage.apply(this, arguments);

		}.bind(this));

		this.pub = zmq.socket('pub');
		this.pub.connect('tcp://' + this.host + ':' + (this.port + 1));
	}
};

Robot.prototype.reconnect = function () {

	if (this.enabled) {
		this.disconnect();
		this.connect();
	}

};

Robot.prototype.disconnect = function () {

	console.log('Disconnected from robot on tcp://' + this.host + ':' + this.port);

	try {
		this.sub.removeAllListeners();
		this.sub.disconnect('tcp://' + this.host + ':' + this.port);
		this.sub.close();
	} catch (e) {}

	try {
		this.pub.removeAllListeners();
		this.pub.disconnect('tcp://' + this.host + ':' + (this.port + 1));
		this.pub.close();
	} catch (e) {}

};

Robot.prototype.enable = function () {
	this.enabled = true;
	this.connect();
};

Robot.prototype.disable = function () {
	this.enabled = false;
	this.disconnect();
};

Robot.prototype.onMessage = function (data) {

	if (this.recording) {
		this.record(data);
	}

	try {
		this.emit('message', data);
	} catch (err) {
		console.log(err);
	}

};

Robot.prototype.getModel = function () {
	return {
		id: this.id,
		host: this.host,
		port: this.port,
		name: this.name,
		enabled: this.enabled,
		recording: this.recording
	}
};

Robot.prototype.startRecording = function () {
	this.recording = true;
	// If our file is not yet open
	if (this.recordingFile === null) {
		try { fs.mkdirSync('logs'); } catch(e) {}
		try { fs.mkdirSync('logs/' + this.host + "_" + this.port); } catch(e) {}

		this.recordingFile = fs.createWriteStream('logs/' + this.host + "_" + this.port + '/' + Date.now() + '.nbs');
	}
};

Robot.prototype.stopRecording = function () {
	this.recording = false;
	if (this.recordingFile) {
		this.recordingFile.end();
		this.recordingFile = null;
	}
};

Robot.prototype.record = function (message) {
	// Get the data portion of our stream
	data = message.slice(2);

	// Get the length of the data
	var len = new Buffer(4);
	len.writeUInt32LE(data.length, 0);

	// // Write the two to the stream
	this.recordingFile.write(len);
	this.recordingFile.write(data);
};

Robot.prototype.send = function (data) {
	this.pub.send(data);
};

module.exports = Robot;
