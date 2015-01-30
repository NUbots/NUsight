Ext.define('NU.view.window.GameStateController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.GameState',
	init: function () {
		var view = this.getView();
		view.mon(NU.Network, 'game_state', this.onGameState, this);
	},
	onSelectRobot: function (robotIP) {
		var store = this.getStore();
		store.clearFilter(true);
		store.addFilter({
			property: 'robotIP', value: robotIP
		});
		this.callParent(arguments);
	},
	onClearStateLog: function () {
		var store = this.getStore();
		store.remove(store.query('robotIP', this.getRobotIP()).items);
	},
	onGameState: function (robotIP, gameState, timestamp) {
		// TODO: remove
		if (robotIP !== this.getRobotIP()) {
			return;
		}

		var store = this.getStore();
		store.add({
			time: timestamp,
			robotIP: robotIP,
			eventName: gameState.getEvent(),
			state: gameState.getData()
		});
	},
	getStore: function () {
		return this.lookupReference('gameStates').getStore();
	}
});
