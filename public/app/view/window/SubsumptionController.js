Ext.define('NU.view.window.SubsumptionController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Subsumption',
	init: function () {
		var view = this.getView();
		view.mon(NU.Network, 'subsumption', this.onSubsumption, this);
	},
	onClearActionTable: function () {
		this.lookupReference('actions').getStore().removeAll();
	},
	onClearStateLog: function () {
		this.lookupReference('logs').getStore().removeAll();
	},
	onSubsumption: function (robotIP, event, timestamp) {
		// TODO: remove
		if (robotIP !== this.getRobotIP()) {
			return;
		}

		var type = event.getType();
		switch (type) {
			case API.Subsumption.Type.ACTION_REGISTER:
				this.onActionRegister(robotIP, event.getActionRegister(), timestamp);
				break;
			case API.Subsumption.Type.ACTION_STATE:
				this.onActionStateChange(robotIP, event.getActionStateChange(), timestamp);
				break;
			default:
				console.error('Unknown behaviour type: ', type);
		}
	},
	onActionRegister: function (robotIP, actionRegister, timestamp) {
		console.log(actionRegister);
	},
	onActionStateChange: function (robotIP, stateActionChange, timestamp) {
		this.lookupReference('logs').getStore().add({
			robotIP: robotIP,
			time: timestamp,
			name: stateActionChange.getName(),
			limbs: stateActionChange.getLimbs(),
			state: stateActionChange.getState()
		});
	}
});
