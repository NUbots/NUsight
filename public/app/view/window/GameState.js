Ext.define('NU.view.window.GameState', {
	extend : 'NU.view.window.Display',
	alias : ['widget.nu_gamecontroller_window'],
	controller: 'NU.controller.GameState',
	inject: [
		'gameControllerPacketsStore'
	],
	config: {
		'gameControllerPacketsStore': null
	},
	title: 'GameState',
	width: 600,
	height: 400,
	initComponent: function () {
		var me = this;
		Ext.apply(this, {
			items: [{
				xtype: 'grid',
				store: this.getGameControllerPacketsStore(),
				columns: [
					{text: 'Time', dataIndex: 'time', xtype: 'datecolumn', format: 'H:i:s', width: 75},
					{text: 'Event', flex: 1, renderer: function(value, metaData, record) {
						return me.renderEvent(record);
					}}
				]
			}]
		});
		return this.callParent(arguments);
	},
	renderEvent: function (record) {
		switch (record.get('eventName')) {
			case 'stateInitial':
				return this.renderInitialEvent(record);
			case 'statePlaying':
				return this.renderPlayingEvent(record);
		}
	},
	renderInitialEvent: function (record) {
		return 'State changed to INITIAL';
	},
	renderPlayingEvent: function (record) {
		return 'State changed to PLAYING';
	}
});
