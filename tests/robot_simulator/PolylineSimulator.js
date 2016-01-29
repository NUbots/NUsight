var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function PolylineSimulator () {
	RobotSimulator.call(this);

	this.loadProto('message.support.nubugger.proto.DrawObjects');
}
util.inherits(PolylineSimulator, RobotSimulator);

PolylineSimulator.prototype.run = function () {
	var message = new this.API.message.support.nubugger.proto.DrawObjects({
		objects: [{
			shape: 'POLYLINE',
			path: [{
				position: this.randomFieldPosition(),
				parentIndex: 0
			}, {
				position: this.randomFieldPosition(),
				parentIndex: 0
			}, {
				position: this.randomFieldPosition(),
				parentIndex: 0
			}, {
				position: this.randomFieldPosition(),
				parentIndex: 2
			}, {
				position: this.randomFieldPosition(),
				parentIndex: 0
			}]
		}]
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new PolylineSimulator().runEvery(5000);
}
