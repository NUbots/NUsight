var net, util, events, zmq, dgram;

net = require('net');
util = require('util');
events = require('events');
zmq = require('zmq');
fs = require('fs');
dgram = require('dgram');

function Robot (host, port, robotName) {

	if (port === undefined) {
		port = 12000;
	}

	this.host = host;
	this.port = port;
	this.name = robotName;
	// Robot to Node
	this.sub = null;
	// Node to Robot
	this.pub = null;
}

util.inherits(Robot, events.EventEmitter);

Robot.prototype.connect = function () {

	this.sub = zmq.socket('sub');
	this.sub.connect('tcp://' + this.host + ':' + this.port);
	console.log('Connecting to robot on tcp://' + this.host + ':' + this.port);
	this.sub.subscribe("");

	this.sub.on('message', function () {

		this.onMessage.apply(this, arguments);

	}.bind(this));

	this.pub = zmq.socket('pub');
	this.pub.connect('tcp://' + this.host + ':' + (this.port + 1));
};

Robot.prototype.reconnect = function () {

	this.disconnect();
	this.connect();

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

Robot.prototype.onMessage = function (data) {

	try {
		this.emit("message", data);
	} catch (err) {
		console.log(err);
	}

};

Robot.prototype.send = function (data) {
	this.pub.send(data);
};

module.exports = Robot;
