Ext.define('NU.view.window.GameStateController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.GameState',
	init: function () {
		this.mon(NU.Network, 'message.input.proto.GameState', this.onGameState, this);
	},
	onSelectRobot: function (robotId) {
		var store = this.getStore();
		store.clearFilter(true);
		store.addFilter({
			property: 'robotId', value: robotId
		});
		this.callParent(arguments);
	},
	onClearStateLog: function () {
		var store = this.getStore();
		store.remove(store.query('robotId', this.getRobotId()).items);
	},
	onGameState: function (robot, gameState, timestamp) {
		// TODO: remove
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		var store = this.getStore();
		store.add({
			time: timestamp,
			robotId: robot.get('id'),
			eventName: gameState.getEvent(),
			state: gameState.getData()
		});
	},
	getStore: function () {
		return this.lookupReference('gameStates').getStore();
	}
});
