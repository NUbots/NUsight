var RobotFinder = require('./RobotFinder');
var Robot = require('./Robot');
var RobotList = require('./RobotList');
var Client = require('./Client');
var fs = require('fs');
var util = require('util');
var events = require('events');
var yaml = require('js-yaml');

function NUsight (io) {

	this.io = io;
	this.clients = [];
	this.files = [];
	this.robots = new RobotList();

	//this.robotFinder = new RobotFinder('238.158.129.230', 7447);
	//this.robotFinder.listen();
	//this.robotFinder.on('robotIP', function (robotIP) {
	//	this.addRobot(robotIP);
	//}.bind(this));

	this.loadConfig('app/configuration.yaml');

	this.io.sockets.on('connection', function (socket) {

		var client = new Client(socket);

		this.clients.push(client);

		this.robots.forEach(function (robot) {
			socket.emit('addRemoteRobot', robot.getModel());
		}, this);

		console.log('New web client', this.clients.length);

		socket.on('message', function (robotId, message) {
			var robot = this.robots.getRobot(robotId);
			if (robot !== null) {
				robot.send(message);
			}
		}.bind(this));

		socket.on('broadcast', function (message) {
			this.robots.forEach(function (robot) {
				robot.send(message);
			});
		}.bind(this));

		socket.on('addRobot', function (robotId, robotIP, robotPort, robotName) {
			if (this.robots.getRobot(robotId) === null) {
				this.robots.addRobot(robotId, robotIP, robotPort, robotName);
			}
		}.bind(this));

		socket.on('removeRobot', function (robotId) {
			this.robots.removeRobot(robotId);
		}.bind(this));

		socket.on('enableRobot', function (robotId) {
			var robot = this.robots.getRobot(robotId);
			if (robot !== null) {
				robot.enable();
			}
		}.bind(this));

		socket.on('disableRobot', function (robotId) {
			var robot = this.robots.getRobot(robotId);
			if (robot !== null) {
				robot.disable();
			}
		}.bind(this));

		socket.on('startRecording', function (robotId) {
			var robot = this.robots.getRobot(robotId);
			if (robot !== null) {
				robot.startRecording();
			}
		}.bind(this));

		socket.on('stopRecording', function (robotId) {
			var robot = this.robots.getRobot(robotId);
			if (robot !== null) {
				robot.stopRecording();
			}
		}.bind(this));

		socket.on('disconnect', function () {
			this.clients.splice(this.clients.indexOf(client), 1);
			console.log('Lost web client', this.clients.length);
		}.bind(this));

		socket.on('reconnectRobots', function () {
			this.robots.forEach(function (robot) {
				robot.reconnect();
			}, this);
		}.bind(this));

	}.bind(this));

}

util.inherits(NUsight, events.EventEmitter);

NUsight.prototype.loadConfig = function (filename) {

	var config = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));

	config.robots.forEach(function (robotConfig) {

		var address = robotConfig.addresses[robotConfig.defaultAddress || 'wifi'];
		var robotName = robotConfig.name;

		var robot = this.robots.addRobot(robotConfig.id, address.host, address.port || 12000, robotName);
		robot.on('message', function (message) {
			this.onMessage(robot.id, message);
		}.bind(this));

		//this.clients.forEach(function (client) {
		//	client.socket.emit('robotIP', robotIP, robotName);
		//});

	}, this);

};


NUsight.prototype.onMessage = function (robotId, message) {

	this.clients.forEach(function (client) {
		client.sendMessage(robotId, message);
	}, this);

};

module.exports = NUsight;
