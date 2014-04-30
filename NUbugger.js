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
	self.addRobot('10.0.1.52', 'Robot #2');

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
//				console.log('message to', robotIP, '-', message.length);
				robot.send(new Buffer(message, 'base64'));
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

	//var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log';
	/*var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/test.log';
	 var input = fs.createReadStream(filename);
	 var remaining = '';
	 var self = this;
	 var lines = [];
	 var index = 0;

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

	 setInterval(function () {

	 //console.log('message', '10.0.1.54', lines[index]);//, index, lines.length);

	 self.emit('message', '10.0.1.54', lines[index]);

	 index = (index + 1) % lines.length;

	 }, 10);
	 });

	 input.on('line', function (line) {

	 lines.push(line);

	 });*/

	/*while (true) {
	 lines.forEach(function (line) {
	 self.emit(line);
	 })
	 }*/

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

	//console.log(robotIP, message.length);
	//var timestamp = Date.now();
	var filename = "c:/Users/Brendan/Documents/data.log";

	//fs.appendFile(filename, message.toString('base64') + "\n");

	//console.log(robotIP, message);

	self.clients.forEach(function (client) {

		client.socket.emit('message', robotIP, message.toString('base64'));
		//client.sub.emit('message', robotIP, message);

	});

	//var timestamp = Date.now();
	//var filename = "logs/log_" + timestamp + ".log";
	//
	// TODO: make it one callback!?
	//
	//self.robot.on("message", function (message) {
	//
	//count++;
	////fs.appendFile(filename, message);
	//sub.emit("message", message.toString('base64'));
	//
	//});

};

module.exports = NUbugger;
