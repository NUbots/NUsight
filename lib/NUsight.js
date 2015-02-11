var RobotFinder = require('./RobotFinder');
var Robot = require('./Robot');
var Client = require('./Client');
var fs = require('fs');
var util = require('util');
var events = require('events');

function NUsight (io) {

	this.io = io;
	this.robots = [];
	this.clients = [];
	this.robotFinder = new RobotFinder('238.158.129.230', 7447);
	this.robotFinder.listen();
	this.robotFinder.on('robotIP', function (robotIP) {
		this.addRobot(robotIP);
	}.bind(this));
	this.addRobot('127.0.0.1', 'Virtual Machine');
	this.addRobot('10.1.1.1', 'Robot #1');
	this.addRobot('10.1.2.1', 'Robot #1e');
	this.addRobot('10.1.1.2', 'Robot #2');
	this.addRobot('10.1.2.2', 'Robot #2e');
	this.addRobot('10.1.1.3', 'Robot #3');
	this.addRobot('10.1.2.3', 'Robot #3e');
	this.addRobot('10.1.1.4', 'Robot #4');
	this.addRobot('10.1.2.4', 'Robot #4e');
	this.addRobot('10.1.1.5', 'Robot #5');
	this.addRobot('10.1.2.5', 'Robot #5e');

	this.io.sockets.on('connection', function (socket) {

		var client = new Client(socket);

		this.clients.push(client);

		this.robots.forEach(function (robot) {

			socket.emit('robotIP', robot.host, robot.name);

		}.bind(this));

		console.log('New web client', this.clients.length);

		socket.on('message', function (robotIP, message) {
			var robot = this.getRobot(robotIP);
			if (robot !== null) {
				robot.send(message);
			}
		}.bind(this));

		socket.on('broadcast', function (message) {
			this.robots.forEach(function (robot) {
				robot.send(message);
			});
		}.bind(this));

		socket.on('addRobot', function (robotIP, robotName) {
			if (this.getRobot(robotIP) === null) {
				this.addRobot(robotIP, robotName);
			}
		}.bind(this));

		socket.on('removeRobot', function (robotIP) {
			if (this.getRobot(robotIP) !== null) {
				this.removeRobot(robotIP);
			}
		}.bind(this));

		socket.on('disconnect', function () {

			this.clients.splice(this.clients.indexOf(client), 1);

			console.log('Lost web client', this.clients.length);

		}.bind(this));

	}.bind(this));

	this.on('message', function (robotIP, message) {

		this.onMessage(robotIP, message);

	}.bind(this));

}

util.inherits(NUsight, events.EventEmitter);

NUsight.prototype.getRobot = function (robotIP) {
	var result = null;
	this.robots.forEach(function (robot) {
		if (robot.host === robotIP) {
			result = robot;
			return false;
		}
	}.bind(this));
	return result;
};

NUsight.prototype.removeRobot = function (robotIP) {
	this.robots.forEach(function (robot, index) {
		if (robot.host === robotIP) {
			try {
				robot.disconnect();
			} catch (e) {
				console.log('Error disconnecting to:', robotIP);
			}
			this.robots.splice(index, 1);
			return false;
		}
	}.bind(this));
};

NUsight.prototype.addRobot = function (robotIP, robotName) {

	var robot = new Robot(robotIP, undefined, robotName);
	try {
		robot.connect();
	} catch(e) {
		console.log(e);
		console.log('Error connecting to:', robotIP);
	}
	robot.on('message', function (message) {

		this.emit('message', robotIP, message);

	}.bind(this));

	this.clients.forEach(function (client) {
		client.socket.emit('robotIP', robotIP, robotName);
	});

	this.robots.push(robot);

};

NUsight.prototype.addRobots = function (robotIPs)
{
	if (!Array.isArray(robotIPs))
	{
		robotIPs = [robotIPs];
	}

	robotIPs.forEach(function (robotIP) {

		this.addRobot(robotIP);

	}.bind(this));
};

NUsight.prototype.onMessage = function (robotIP, message) {

	this.clients.forEach(function (client) {

		var type = message[0];
		var filterId = message[1];
		if (filterId === 0) {
			client.socket.emit('message', robotIP, message);
		} else {
			var hash = type + ':' + filterId + ':' + robotIP;
			var now = Date.now();
			var timeout = 1000 * 2;
			var timedOut = client.cache[hash] !== undefined && client.cache[hash] + timeout < now;
			if (client.cache[hash] === undefined || timedOut) {
				if (timedOut) {
					console.warn('ACK not received for:', hash);
				}
				client.cache[hash] = now;
				client.socket.emit('message', robotIP, message, function () {
					delete client.cache[hash];
				}.bind(this));
			}
		}

	}.bind(this));

};

module.exports = NUsight;
