Ext.define('NU.view.window.GameStateController', {
	extend: 'NU.view.window.DisplayController',
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
	onSelectRobot: function (robotIP) {
		// TODO
		/*var store = this.getGameStatesStore();
		store.clearFilter(true);
		store.filter([{
			property: 'robotIP', value: robotIP
		}]);*/
		this.callParent(arguments);
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
