var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function SubsumptionSimulator () {
	RobotSimulator.call(this);
}
util.inherits(SubsumptionSimulator, RobotSimulator);

SubsumptionSimulator.prototype.run = function () {
	var message = new this.API.Message({
		type: this.API.Message.Type.SUBSUMPTION,
		filter_id: 0,
		utc_timestamp: Date.now(),
		subsumption: {
			type: 1,
			action_register: {
				id: Math.floor(Math.random()) + 1,
				name: 'WalkEngine',
				limb_set: [{
					priority: Math.floor(Math.random() * 10) + 1,
					limbs: Math.floor(Math.random() * 5) + 1
				}]
			}
			//action_state_change: {
			//	state: 1,
			//	name: 'name',
			//	limbs: Math.floor(Math.random() * 5) + 1
			//}
		}
	});
	this.sendMessage(message);

};

if (require.main === module) {
	new SubsumptionSimulator().runEvery(5000);
}

