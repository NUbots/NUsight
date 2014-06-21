Ext.define('NU.controller.Behaviour', {
	extend: 'NU.controller.Display',
	config: {

	},
	control: {
		'logs': true
	},
	init: function () {
		NU.util.Network.on('behaviour', Ext.bind(this.onBehaviour, this));
	},
	onBehaviour: function (robotIP, event) {
		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var type = event.getType();
		switch (type) {
			case API.Behaviour.Type.ACTION_STATE:
				this.actionStateChange(event.getActionStateChange());
				break;
			default:
				console.error('Unknown behaviour type: ', type);
		}
	},
	actionStateChange: function (stateActionChange) {
		var name = stateActionChange.getName();
		var state = stateActionChange.getState();
		var State = API.ActionStateChange.State;
		switch (state) {
			case State.START:
				this.addLog(name + " gained control");
				break;
			case State.KILL:
				this.addLog(name + " lost control");
				break;
			default:
				console.error('Unknown action state change:', state);
		}
	},
	addLog: function (message) {
		this.getLogs().body.insertHtml("beforeEnd", {
			tag: 'div',
			html: message
		});
	}
});
