Ext.define('NU.view.window.GameState', {
	extend : 'NU.view.window.Display',
	alias : ['widget.nu_gamecontroller_window'],
	controller: 'NU.controller.GameState',
	inject: [
		'gameStatesStore'
	],
	config: {
		'gameStatesStore': null
	},
	title: 'GameState',
	width: 600,
	height: 400,
	initComponent: function () {
		var me = this;
		Ext.apply(this, {
			tbar: [{
				xtype: 'robot_selector'
			}, '->', {
				itemId: 'clearStateLog',
				text: 'Clear Log'
			}],
			layout: 'hbox',
			items: [{
				itemId: 'gameStates',
				xtype: 'grid',
				store: this.getGameStatesStore(),
				layout: 'fit',
				flex: 1,
				columns: [
					{text: 'Time', dataIndex: 'time', xtype: 'datecolumn', format: 'H:i:s', width: 75},
					{text: 'Event', flex: 1, renderer: function(value, metaData, record) {
						return Ext.htmlEncode(me.renderEvent(record));
					}}
				]
			}, {
				xtype: 'splitter'
			}, {
				itemId: 'state',
				xtype: 'grid',
				store: [],
				layout: 'fit',
				flex: 1,
				columns: [
					{text: 'Key'},
					{text: 'Value'}
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
			default:
				return record.get('eventName');
		}
	},
	renderInitialEvent: function (record) {
		return 'State changed to INITIAL';
	},
	renderPlayingEvent: function (record) {
		return 'State changed to PLAYING';
	}
});
