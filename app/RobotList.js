var events = require('events');
var util = require('util');
var Robot = require('./Robot');

function RobotList() {
	this.robots = [];
}

util.inherits(RobotList, events.EventEmitter);

RobotList.prototype.getRobot = function (robotId) {
	var result = null;
	this.robots.forEach(function (robot) {
		if (robot.id === robotId) {
			result = robot;
			return false;
		}
	}, this);
	return result;
};

RobotList.prototype.removeRobot = function (robotId) {
	this.robots.forEach(function (robot, index) {
		if (robot.id === robotId) {
			try {
				robot.disconnect();
			} catch (e) {
				console.log('Error disconnecting to:', robotId);
			}
			this.robots.splice(index, 1);
			return false;
		}
	}, this);
};

RobotList.prototype.addRobot = function (robotId, robotIP, robotPort, robotName) {

	var robot = new Robot(robotId, robotIP, robotPort, robotName);
	try {
		robot.connect();
	} catch(e) {
		console.log(e);
		console.log('Error connecting to:', robotId);
	}

	this.robots.push(robot);
	this.emit('add_robot', robot);
	return robot;

};

RobotList.prototype.addRobots = function (robotIPs) {
	if (!Array.isArray(robotIPs)) {
		robotIPs = [robotIPs];
	}

	robotIPs.forEach(function (robotIP) {
		this.addRobot(robotIP);
	}, this);
};

RobotList.prototype.forEach = function () {
	return this.robots.forEach.apply(this.robots, arguments);
};

module.exports = RobotList;
