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
	this.lite = null;
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

	this.lite = dgram.createSocket('udp4');

	this.lite.on('message', function () {

		this.onLiteMessage.apply(this, arguments);

	}.bind(this));

	this.lite.bind(this.port);

};

Robot.prototype.disconnect = function () {

	console.log('Disconnected from robot on tcp://' + this.host + ':' + this.port);

	this.sub.removeAllListeners();
	this.sub.disconnect('tcp://' + this.host + ':' + this.port);
	this.sub.close();

	this.pub.removeAllListeners();
	this.pub.disconnect('tcp://' + this.host + ':' + (this.port + 1));
	this.pub.close();

};

Robot.prototype.connect2 = function () {

	console.log('yes');

	//fs.readFile('/cygdrive/c/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log', function (err, data) {

	var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log';

	var input = fs.createReadStream(filename);

	var remaining = '';

	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		while (index > -1) {
			var line = remaining.substring(0, index);
			remaining = remaining.substring(index + 1);
			input.emit('line', line);
			index = remaining.indexOf('\n');
		}
	}.bind(this));

	input.on('end', function() {
		if (remaining.length > 0) {
			input.emit('line', line);
		}
	}.bind(this));

	input.on('line', function (line) {

		//console.log(line);
		//this.onMessage(line);

	}.bind(this));

	/*fs.open(filename, 'r', function (fd) {
	 fs.read(fd, function (err, data) {

	 console.log('salkdfjasldkfjs');

	 console.log(err, data.length);

	 var lines = data.split("\n");

	 lines.forEach(function (line) {

	 // base64 decode? maybe not
	 // emit as event
	 console.log('test');

	 });

	 });*/

};

Robot.prototype.onLiteMessage = function (data) {

	try {
		this.emit("lite_message", data);
		console.log('lite message!');
	} catch (err) {
		console.log(err);
	}

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
