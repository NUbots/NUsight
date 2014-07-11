Ext.define('NU.controller.GameState', {
	extend: 'NU.controller.Display',
	init: function () {
		NU.util.Network.on('game_state', Ext.bind(this.onGameState, this));
	},
	onGameState: function (robotIP, gameState) {
		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		console.log(gameState.getEvent());
	}
});
