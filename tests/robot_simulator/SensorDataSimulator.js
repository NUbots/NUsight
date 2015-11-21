var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function SensorDataSimulator () {
	RobotSimulator.call(this);

	this.loadProto('messages.input.proto.Sensors');

	this.message = new this.API.messages.input.proto.Sensors({
		timestamp: Date.now(),
		voltage: 12,
		battery: Math.random(),
		servo: this.createServos()
	});
}
util.inherits(SensorDataSimulator, RobotSimulator);

SensorDataSimulator.prototype.createServos = function () {
	var servos = [];
	for (var id = 0; id < 20; id++) {
		servos.push(this.createServo(id));
	}
	return servos;
};

SensorDataSimulator.prototype.createServo = function (id) {
	return {
		errorFlags: 0,
		id: id
	}
};

SensorDataSimulator.prototype.run = function () {
	this.message.getServo().forEach(function (servo) {

		if (servo.__clockwise__ === undefined) {
			servo.__clockwise__ = true;
		}

		if (Math.random() < 0.05) {
			servo.__clockwise__ = !servo.__clockwise__;
		}

		servo.setPresentPosition(servo.getPresentPosition() + (servo.__clockwise__ ? 1 : -1) * Math.PI / 180);
	}, this);
	this.sendMessage(this.message);
};

if (require.main === module) {
	new SensorDataSimulator().runEvery(50);
}
