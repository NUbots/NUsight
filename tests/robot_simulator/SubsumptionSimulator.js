var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function SubsumptionSimulator () {
	RobotSimulator.call(this);
}
util.inherits(SubsumptionSimulator, RobotSimulator);

SubsumptionSimulator.prototype.run = function () {

	var actions = [{
		name: 'action_register',
		data: {
			id: Math.floor(Math.random()) + 1,
			name: 'WalkEngine',
			limb_set: [{
				priority: Math.floor(Math.random() * 10) + 1,
				limbs: Math.floor(Math.random() * 5) + 1
			}]
		}
	}, {
		name: 'action_state_change',
		data: {
			state: 1,
			name: 'name',
			limbs: Math.floor(Math.random() * 5) + 1
		}
	}, {
		name: 'action_priority_change',
		data: {
			id: 1,
			priorities: [1, 2, 3, 4, 5]
		}
	}];

	var message = new this.API.Message({
		type: this.API.Message.Type.SUBSUMPTION,
		filter_id: 0,
		utc_timestamp: Date.now(),
		subsumption: {}
	});

	var index = this.randInt(0, actions.length);
	var action = actions[index];
	message.subsumption[action.name] = action.data;
	this.sendMessage(message);

};

if (require.main === module) {
	new SubsumptionSimulator().runEvery(5000);
}

