var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function VisionLinesSimulator () {
	RobotSimulator.call(this);
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

	var message = new this.API.Message({
		type: this.API.Message.Type.VISION_OBJECT,
		filter_id: 0,
		utc_timestamp: Date.now(),
		vision_object: {
			camera_id: 0,
			type: this.API.VisionObject.ObjectType.LINE,
			line: lines
		}
	});

	this.sendMessage(message);

};

if (require.main === module) {
	new VisionLinesSimulator().runEvery(100);
}
