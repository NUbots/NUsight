var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function SensorDataSimulator () {
	RobotSimulator.call(this);
}
util.inherits(SensorDataSimulator, RobotSimulator);

SensorDataSimulator.prototype.run = function () {
	var message = new this.API.Message({
		type: this.API.Message.Type.SENSOR_DATA,
		filter_id: 0,
		utc_timestamp: Date.now(),
		sensor_data: {
			timestamp: Date.now(),
			voltage: 12,
			battery: Math.random()
		}
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new SensorDataSimulator().runEvery(5000);
}
