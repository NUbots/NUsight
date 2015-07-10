Ext.define('NU.view.window.GameState', {
	extend : 'NU.view.window.Display',
	alias : ['widget.nu_gamecontroller_window'],
	requires: [
		'NU.view.window.GameStateController',
		'NU.store.GameStates',
		'Ext.grid.Panel',
		'Ext.grid.column.Date'
	],
	controller: 'GameState',
	title: 'GameState',
	width: 600,
	height: 400,
	initComponent: function () {
		var me = this;
		Ext.apply(this, {
			tbar: {
				xtype: 'toolbar',
				layout: {
					overflowHandler: 'Menu'
				},
				items: [{
					xtype: 'robot_selector',
					listeners: {
						selectRobot: 'onSelectRobot'
					}
				}, '->', {
					text: 'Clear Log',
					listeners: {
						click: 'onClearStateLog'
					}
				}]
			},
			items: [{
				reference: 'gameStates',
				xtype: 'grid',
				store: Ext.create('NU.store.GameStates'),
				columns: [
					{text: 'Time', dataIndex: 'time', xtype: 'datecolumn', format: 'H:i:s', width: 75},
					{text: 'Event', flex: 1, renderer: function(value, metaData, record) {
						return Ext.htmlEncode(me.renderEvent(record));
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
