var RobotFinder = require('./RobotFinder');
var Robot = require('./Robot');
var Client = require('./Client');
var fs = require('fs');
var util = require('util');
var events = require('events');
var yaml = require('js-yaml');

function NUsight (io) {

	this.io = io;
	this.robots = [];
	this.clients = [];
	this.files = [];

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

	config.robots.forEach(function (robot) {

		var address = robot.addresses[robot.defaultAddress || 'wifi'];

		this.addRobot(address.host, robot.name, address.port || 12000);

	}, this);

};

NUsight.prototype.getRobot = function (robotIP) {
	var result = null;
	this.robots.forEach(function (robot) {
		if (robot.host === robotIP) {
			result = robot;
			return false;
		}
	}, this);
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
	}, this);
};

NUsight.prototype.addRobot = function (robotIP, robotName, port) {

	var robot = new Robot(robotIP, port, robotName);
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

	return robot;

};

NUsight.prototype.addRobots = function (robotIPs)
{
	if (!Array.isArray(robotIPs)) {
		robotIPs = [robotIPs];
	}

	robotIPs.forEach(function (robotIP) {
		this.addRobot(robotIP);
	}, this);
};

NUsight.prototype.onMessage = function (robotIP, message) {

	// Save the file! Yay?
	if (false) {
		// If our file is not yet open
		if(this.files[robotIP] === undefined) {
			try { fs.mkdirSync('logs'); } catch(e) {}
			try { fs.mkdirSync('logs/' + robotIP); } catch(e) {}

			this.files[robotIP] = fs.createWriteStream('logs/' + robotIP + '/' + Date.now() + '.nbs');
		}

		// Get our output
		var out = this.files[robotIP];

		// Get the data portion of our stream
		data = message.slice(2);

		// Get the length of the data
		len = new Buffer(4);
		len.writeUInt32LE(data.length, 0);

		// // Write the two to the stream
		out.write(len);
		out.write(data);
	}

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

	}, this);

};

module.exports = NUsight;
