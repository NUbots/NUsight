Ext.define('NU.controller.GameState', {
	extend: 'NU.controller.Display',
	alias: 'controller.GameState',
	config: {
		gameStatesStore: null
	},
	init: function () {
		var view = this.getView();
		view.mon(NU.util.Network, 'game_state', this.onGameState, this);
	},
	onAfterRender: function () {
		this.setGameStatesStore(this.lookupReference('gameStates').getStore());
	},
	onSelectRobot: function (combo, records, eOpts) {
		var store = this.getGameStatesStore();
		store.clearFilter(true);
		store.filter([{
			property: 'robotIP', value: robotIP
		}]);
	},
	onClearStateLog: function () {
		var store = this.getGameStatesStore();
		store.remove(store.query('robotIP', this.robotIP).items);
	},
	onGameState: function (robotIP, gameState, timestamp) {
		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var store = this.getGameStatesStore();
		store.add({
			time: timestamp,
			robotIP: robotIP,
			eventName: gameState.getEvent(),
			state: gameState.getData()
		});
	}
});
