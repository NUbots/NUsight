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

	this.robotFinder = new RobotFinder('238.158.129.230', 7447);
	this.robotFinder.listen();
	this.robotFinder.on('robotIP', function (robotIP) {
		this.addRobot(robotIP);
	}.bind(this));

	this.loadConfig('app/configuration.yaml');

	this.io.sockets.on('connection', function (socket) {

		var client = new Client(socket);

		this.clients.push(client);

		this.robots.forEach(function (robot) {
			socket.emit('robotIP', robot.host, robot.name);
		}, this);

		console.log('New web client', this.clients.length);

		socket.on('message', function (robotIP, message) {
			var robot = this.robots.getRobot(robotIP);
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
			if (this.robots.getRobot(robotIP) === null) {
				this.robots.addRobot(robotIP, robotName);
			}
		}.bind(this));

		socket.on('removeRobot', function (robotIP) {
			if (this.robots.getRobot(robotIP) !== null) {
				this.robots.removeRobot(robotIP);
			}
		}.bind(this));

		socket.on('enableRobot', function (robotIP) {
			var robot = this.robots.getRobot(robotIP);
			if (robot !== null) {
				robot.connect();
			}
		}.bind(this));

		socket.on('disableRobot', function (robotIP) {
			var robot = this.robots.getRobot(robotIP);
			if (robot !== null) {
				robot.disconnect();
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

	this.on('message', function (robotIP, message) {
		this.onMessage(robotIP, message);
	}.bind(this));

}

util.inherits(NUsight, events.EventEmitter);

NUsight.prototype.loadConfig = function (filename) {

	var config = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));

	config.robots.forEach(function (robotConfig) {

		var address = robotConfig.addresses[robotConfig.defaultAddress || 'wifi'];

		var robot = this.robots.addRobot(address.host, robotConfig.name, address.port || 12000);

		robot.on('message', function (message) {

			this.onMessage(address.host, message);

		}.bind(this));

		this.clients.forEach(function (client) {
			client.socket.emit('robotIP', robotIP, robotName);
		});

	}, this);

};


NUsight.prototype.onMessage = function (robotIP, message) {

	this.clients.forEach(function (client) {

		client.sendMessage(robotIP, message);

	}, this);

};

module.exports = NUsight;
