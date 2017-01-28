var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function VisionLinesSimulator () {
	RobotSimulator.call(this);

	this.loadProto('message.vision.VisionObjects');
}
util.inherits(VisionLinesSimulator, RobotSimulator);

VisionLinesSimulator.prototype.run = function () {
	var lines = [];
	var n = Math.floor(10 * Math.random() + 1);
	var width = 320;
	var height = 240;
	for (var i = 0; i < n; i++) {
		lines.push({
			start: {x: this.randInt(0, width), y: this.randInt(0, height)},
			end: {x: this.randInt(0, width), y: this.randInt(0, height)},
			colour: this.randColor()
		});
	}

	var message = new this.API.message.vision.NUsightLines({
		lines: lines
	});

	this.sendMessage(message);

};

if (require.main === module) {
	new VisionLinesSimulator().runEvery(100);
}
