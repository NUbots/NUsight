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
	this.config = 'app/configuration.yaml';

	//this.robotFinder = new RobotFinder('238.158.129.230', 7447);
	//this.robotFinder.listen();
	//this.robotFinder.on('robotIP', function (robotIP) {
	//	this.addRobot(robotIP);
	//}.bind(this));

	this.loadConfig(this.config);

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
				this.addRobot(robotId, robotIP, robotPort, robotName);
			}
		}.bind(this));

		socket.on('removeRobot', function (robotId) {
			this.removeRobot(robotId);
		}.bind(this));

		socket.on('updateRobot', function (robotId, values) {
			var robot = this.robots.getRobot(robotId);
			if (robot === null) {
				this.addRobot(robotId, values.host, values.port, values.name);
			} else {
				this.updateRobot(robot, values);
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

NUsight.prototype.addRobot = function (robotId, robotIP, robotPort, robotName) {
	var robot = this.robots.addRobot(robotId, robotIP, robotPort, robotName);
	var config = this.loadDefaultConfig();
	var found = false;
	var robots = config.robots;
	robots.forEach(function (robotConfig) {
		if (robotId === robotConfig.id) {
			found = true;
			return false;
		}
	});
	if (!found) {
		this.addRobotConfig(robots, robot);
		this.saveDefaultConfig(config);
	}
};

NUsight.prototype.addRobotConfig = function (robots, robot) {
	robots.push({
		id: robot.id,
		name: robot.name,
		enabled: robot.enabled,
		recording: robot.recording,
		defaultAddress: 'wifi',
		addresses: {
			wifi: {
				host: robot.host,
				port: robot.port
			}
		}
	});
};

NUsight.prototype.removeRobot = function (robotId) {
	this.robots.removeRobot(robotId);
	var config = this.loadDefaultConfig();
	var robots = config.robots;
	robots.forEach(function (robotConfig, i) {
		if (robotId === robotConfig.id) {
			robots.splice(i, 1);
			return false;
		}
	});
	this.saveDefaultConfig(config);
};

NUsight.prototype.updateRobot = function (robot, values) {
	var robotId = robot.id;
	var config = this.loadDefaultConfig();
	config.robots.forEach(function (robotConfig) {
		if (robotId === robot.id) {
			for (var key in values) {
				if (values.hasOwnProperty(key)) {
					this.updateRobotValue(robot, robotConfig, key, values[key]);
				}
			}
			return false;
		}
	}, this);
	this.saveDefaultConfig(config);
};

NUsight.prototype.updateRobotValue = function (robot, robotConfig, key, value) {
	if (key === 'host' || key === 'port') {
		robotConfig.addresses[robotConfig.defaultAddress][key] = value;
	} else {
		robotConfig[key] = value;
		if (key === 'enabled') {
			if (value) {
				robot.enable();
			} else {
				robot.disable();
			}
		} else if (key === 'recording') {
			if (value) {
				robot.startRecording();
			} else {
				robot.stopRecording();
			}
		}
	}
};

NUsight.prototype.loadDefaultConfig = function () {
	return yaml.safeLoad(fs.readFileSync(this.config, 'utf8'));
};

NUsight.prototype.saveDefaultConfig = function (config) {
	fs.writeFile(this.config, yaml.safeDump(config));
};


NUsight.prototype.onMessage = function (robotId, message) {

	this.clients.forEach(function (client) {
		client.sendMessage(robotId, message);
	}, this);

};

module.exports = NUsight;
