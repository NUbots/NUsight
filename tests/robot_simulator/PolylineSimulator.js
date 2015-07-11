var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function PolylineSimulator () {
	RobotSimulator.call(this);
}
util.inherits(PolylineSimulator, RobotSimulator);

PolylineSimulator.prototype.run = function () {
	var message = new this.API.Message({
		type: this.API.Message.Type.DRAW_OBJECTS,
		filter_id: 0,
		utc_timestamp: Date.now(),
		draw_objects: {
			objects: [{
				shape: 'POLYLINE',
				path: [{
					position: this.randomFieldPosition(),
					parent_index: 0
				}, {
					position: this.randomFieldPosition(),
					parent_index: 0
				}, {
					position: this.randomFieldPosition(),
					parent_index: 0
				}, {
					position: this.randomFieldPosition(),
					parent_index: 2
				}, {
					position: this.randomFieldPosition(),
					parent_index: 0
				}]
			}]
		}
	});

	this.sendMessage(message);
};

if (!module.parent) {
	new PolylineSimulator().runEvery(5000);
}
