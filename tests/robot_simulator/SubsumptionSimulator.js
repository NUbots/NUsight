var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function SubsumptionSimulator () {
	RobotSimulator.call(this);

	this.loadProto('message.behaviour.proto.Subsumption');
}
util.inherits(SubsumptionSimulator, RobotSimulator);

SubsumptionSimulator.prototype.run = function () {

	var actions = [{
		name: 'actionRegister',
		data: {
			id: Math.floor(Math.random()) + 1,
			name: 'WalkEngine',
			limbSet: [{
				priority: Math.floor(Math.random() * 10) + 1,
				limbs: Math.floor(Math.random() * 5) + 1
			}]
		}
	}, {
		name: 'actionStateChange',
		data: {
			state: 1,
			name: 'name',
			limbs: Math.floor(Math.random() * 5) + 1
		}
	}, {
		name: 'actionPriorityChange',
		data: {
			id: 1,
			priorities: [1, 2, 3, 4, 5]
		}
	}];

	var data = {};
	var index = this.randInt(0, actions.length);
	var action = actions[index];
	data[action.name] = action.data;

	var message = new this.API.message.behaviour.proto.Subsumption(data);

	this.sendMessage(message);

};

if (require.main === module) {
	new SubsumptionSimulator().runEvery(5000);
}

