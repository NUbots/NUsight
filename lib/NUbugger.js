var RobotFinder = require('./RobotFinder');
var Robot = require('./Robot');
var Client = require('./Client');
var fs = require('fs');
var util = require('util');
var events = require('events');

function NUbugger (io) {

	var self = this;

	self.io = io;
	self.robots = [];
	self.clients = [];
	self.robotFinder = new RobotFinder('238.158.129.230', 7447);
	self.robotFinder.listen();
	self.robotFinder.on('robotIP', function (robotIP) {
		self.addRobot(robotIP);
	});
	self.addRobot('127.0.0.1', 'Virtual Machine');
	self.addRobot('10.0.1.51', 'Robot #1');
	self.addRobot('10.0.1.52', 'Robot #2');
	self.addRobot('10.0.1.53', 'Robot #3');
	self.addRobot('10.0.1.54', 'Robot #4');
	self.addRobot('10.0.1.55', 'Robot #5');
	self.addRobot('10.0.1.56', 'Robot #6');
	self.addRobot('10.0.1.57', 'Robot #7');

	self.io.sockets.on('connection', function (socket) {

		var client = new Client(socket);

		self.clients.push(client);

		self.robots.forEach(function (robot) {

			socket.emit('robotIP', robot.host, robot.name);

		});

		console.log('New web client', self.clients.length);

		socket.on('message', function (robotIP, message) {
			var robot = self.getRobot(robotIP);
			if (robot !== null) {
				robot.send(message);
			}
		});

		socket.on('addRobot', function (robotIP, robotName) {
			if (self.getRobot(robotIP) === null) {
				self.addRobot(robotIP, robotName);
			}
		});
		socket.on('removeRobot', function (robotIP) {
			if (self.getRobot(robotIP) !== null) {
				self.removeRobot(robotIP);
			}
		});

		socket.on('disconnect', function () {

			self.clients.splice(self.clients.indexOf(client), 1);

			console.log('Lost web client', self.clients.length);

		});

	});

	self.on('message', function (robotIP, message) {

		self.onMessage(robotIP, message);

	});

}

util.inherits(NUbugger, events.EventEmitter);

NUbugger.prototype.getRobot = function (robotIP) {
	var self = this;
	var result = null;
	self.robots.forEach(function (robot) {
		if (robot.host === robotIP) {
			result = robot;
			return false;
		}
	});
	return result;
};

NUbugger.prototype.removeRobot = function (robotIP) {
	var self = this;
	self.robots.forEach(function (robot, index) {
		if (robot.host === robotIP) {
			try {
				robot.disconnect();
			} catch (e) {
				console.log('Error disconnecting to:', robotIP);
			}
			self.robots.splice(index, 1);
			return false;
		}
	});
}

NUbugger.prototype.addRobot = function (robotIP, robotName) {

	var self = this;

	var robot = new Robot(robotIP, undefined, robotName);
	try {
		robot.connect();
	} catch(e) {
		console.log(e);
		console.log('Error connecting to:', robotIP);
	}
	robot.on('message', function (message) {

		self.emit('message', robotIP, message);

	});

	self.clients.forEach(function (client) {
		client.socket.emit('robotIP', robotIP, robotName);
	});

	self.robots.push(robot);

};

NUbugger.prototype.addRobots = function (robotIPs)
{
	var self;

	self = this;

	if (!Array.isArray(robotIPs))
	{
		robotIPs = [robotIPs];
	}

	robotIPs.forEach(function (robotIP) {

		self.addRobot(robotIP);

	});
};

NUbugger.prototype.onMessage = function (robotIP, message)
{
	var self;

	self = this;

	self.clients.forEach(function (client) {

		client.socket.emit('message', robotIP, message);

	});

};

module.exports = NUbugger;
