var util = require('util');
var RobotSimulator = require('./RobotSimulator');
var THREE = require('three');
var TAU = 2 * Math.PI;

function LocalisationSimulator (opts) {
	RobotSimulator.call(this, opts);
	this.started = Date.now();

	this.loadProto('message.localisation.Self');
}
util.inherits(LocalisationSimulator, RobotSimulator);

LocalisationSimulator.prototype.run = function () {
	var now = Date.now();
	var elapsedTime = now - this.started;
	var radius = 1;
	var message = new this.API.message.localisation.Self({
		locObject: {
			position: {x:-2,y:1}
			// last_measurement_time : now
		},
		heading : {x:-1,y:-1},
		velocity : {x:0,y:0},
		covariance : {x:{x:1,y:0,z:0},y:{x:0,y:1,z:0},z:{x:0,y:0,z:1}}
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new LocalisationSimulator().runEvery(100);
}

module.exports = LocalisationSimulator;
