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

	var self;

	self = this;

	self.sub = zmq.socket('sub');
	self.sub.connect('tcp://' + self.host + ':' + self.port);
	console.log('Connecting to robot on tcp://' + self.host + ':' + self.port);
	self.sub.subscribe("");

	self.sub.on('message', function () {

		self.onMessage.apply(self, arguments);

	});

	self.pub = zmq.socket('pub');
	self.pub.connect('tcp://' + self.host + ':' + (self.port + 1));

	this.lite = dgram.createSocket('udp4');

	self.lite.on('message', function () {

		self.onLiteMessage.apply(self, arguments);

	});

	this.lite.bind(this.port);

};

Robot.prototype.disconnect = function () {

	var self;

	self = this;

	console.log('Disconnected from robot on tcp://' + self.host + ':' + self.port);

	self.sub.removeAllListeners();
	self.sub.disconnect('tcp://' + self.host + ':' + self.port);
	self.sub.close();

	self.pub.removeAllListeners();
	self.pub.disconnect('tcp://' + self.host + ':' + (self.port + 1));
	self.pub.close();

};

Robot.prototype.connect2 = function () {

	console.log('yes');

	//fs.readFile('/cygdrive/c/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log', function (err, data) {

	var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log';

	var input = fs.createReadStream(filename);

	var remaining = '';

	var self = this;

	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		while (index > -1) {
			var line = remaining.substring(0, index);
			remaining = remaining.substring(index + 1);
			input.emit('line', line);
			index = remaining.indexOf('\n');
		}
	});

	input.on('end', function() {
		if (remaining.length > 0) {
			input.emit('line', line);
		}
	});

	input.on('line', function (line) {

		//console.log(line);
		//self.onMessage(line);

	});

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

	var self;

	self = this;

	try {
		self.emit("lite_message", data);
		console.log('lite message!');
	} catch (err) {
		console.log(err);
	}

};

Robot.prototype.onMessage = function (data) {

	var self;

	self = this;

	try {
		self.emit("message", data);
	} catch (err) {
		console.log(err);
	}

};

Robot.prototype.send = function (data) {
	this.pub.send(data);
}

module.exports = Robot;
