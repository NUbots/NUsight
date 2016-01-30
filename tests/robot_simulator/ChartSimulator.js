var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function ChartSimulator () {
	RobotSimulator.call(this);
	this.loadProto('message.support.nubugger.proto.DataPoint');
}
util.inherits(ChartSimulator, RobotSimulator);

ChartSimulator.prototype.run = function () {
	var now = Date.now();
	var period = 1000 * 10;
	var theta = 2 * Math.PI * now / period;
	var sine = Math.sin(theta);
	var cosine = Math.cos(theta);
	var message = new this.API.message.support.nubugger.proto.DataPoint({
		label: 'Debug Waves',
		value: [sine, cosine, 2 * sine, 4 * cosine],
		type: 'FLOAT_LIST'
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new ChartSimulator().runEvery(50);
}
