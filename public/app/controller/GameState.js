Ext.define('NU.controller.GameState', {
	extend: 'NU.controller.Display',
	config: {
		store: null
	},
	control: {
		'gameStates': true,
		'view': {
			selectRobotIP: function (robotIP) {
				var store = this.getStore();
				store.clearFilter(true);
				store.filter([{
					property: 'robotIP', value: robotIP
				}]);
			}
		},
		'clearStateLog': {
			click: function () {
				var store = this.getView().getGameStatesStore();
				store.remove(store.query('robotIP', this.robotIP).items);
			}
		}
	},
	init: function () {
		var view = this.getView();
		view.mon(NU.util.Network, 'game_state', this.onGameState, this);

		this.setStore(this.getView().getGameStatesStore());
	},
	onGameState: function (robotIP, gameState, timestamp) {
		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var store = this.getStore();
		store.add({
			time: timestamp,
			robotIP: robotIP,
			eventName: gameState.getEvent(),
			state: gameState.getData()
		});
	}
});
