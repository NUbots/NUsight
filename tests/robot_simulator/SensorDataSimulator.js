var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function SensorDataSimulator () {
	RobotSimulator.call(this);

	this.loadProto('messages.input.proto.Sensors');
}
util.inherits(SensorDataSimulator, RobotSimulator);

SensorDataSimulator.prototype.run = function () {
	var message = new this.API.messages.input.proto.Sensors({
		timestamp: Date.now(),
		voltage: 12,
		battery: Math.random()
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new SensorDataSimulator().runEvery(5000);
}
