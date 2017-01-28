var util = require('util');
var RobotSimulator = require('./RobotSimulator');
var THREE = require('three');
var TAU = 2 * Math.PI;

function LocalisationSimulator (opts) {
	RobotSimulator.call(this, opts);
	this.started = Date.now();

	this.loadProto('message.localisation.Localisation');
}
util.inherits(LocalisationSimulator, RobotSimulator);

LocalisationSimulator.prototype.run = function () {
	var now = Date.now();
	var elapsedTime = now - this.started;
	var radius = 1;
	var message = new this.API.message.localisation.Localisation({
		fieldObject: [{
			name: 'self',
			models: [{
				modelId: 0,
				wmX: radius * Math.cos(TAU * elapsedTime / 5000),
				wmY: radius * Math.sin(TAU * elapsedTime / 5000),
				sdX: 1E-1,
				sdY: 2E-1,
				srXx: 3E-1,
				srXy: 4E-1,
				srYy: 5E-1,
				heading: Math.PI * Math.cos(TAU * elapsedTime / 3000),
				sdHeading: 1E-1,
				lost: false
			}]
		}]
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new LocalisationSimulator().runEvery(100);
}

module.exports = LocalisationSimulator;
