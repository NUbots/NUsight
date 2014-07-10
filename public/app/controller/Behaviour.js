Ext.define('NU.controller.Behaviour', {
	extend: 'NU.controller.Display',
	inject: [
		'registerActionTreeStore'
	],
	config: {
		'registerActionTreeStore': null
	},
	control: {
		'actions': true,
		'clearActionTable': {
			click: function () {
				this.getActions().getStore().removeAll();
			}
		},
		'logs': true,
		'clearStateLog': {
			click: function () {
				this.getLogs().getStore().removeAll();
			}
		}
	},
	init: function () {
		NU.util.Network.on('behaviour', Ext.bind(this.onBehaviour, this));
	},
	onBehaviour: function (robotIP, event, timestamp) {
		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var type = event.getType();
		switch (type) {
			case API.Behaviour.Type.ACTION_REGISTER:
				// TODO
				break;
			case API.Behaviour.Type.ACTION_STATE:
				this.onActionStateChange(robotIP, event.getActionStateChange(), timestamp);
				break;
			default:
				console.error('Unknown behaviour type: ', type);
		}
	},
	onActionStateChange: function (robotIP, stateActionChange, timestamp) {
		this.getLogs().getStore().add({
			robotIP: robotIP,
			time: timestamp,
			name: stateActionChange.getName(),
			limbs: stateActionChange.getLimbs(),
			state: stateActionChange.getState()
		});
	}
});
