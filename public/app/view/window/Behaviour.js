Ext.create('Ext.data.Store', {
	storeId: 'test2',
	fields: [
		'id',
		'name',
		'priority'
	],
	data: {
		items: [
			{id: 1, name: 'Head Behaviour', priority: 25}
		]
	},
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'items'
		}
	}
});

Ext.create('Ext.data.Store', {
	storeId: 'test',
	fields: [
		'time',
		'event'
	],
	data: {
		items: [
			{time: 'now', event: 'Walk Engine gained control of Legs'}
		]
	},
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'items'
		}
	}
});

Ext.define('NU.view.window.Behaviour', {
	extend : 'NU.view.window.Display',
	alias : ['widget.nu_behaviour_window'],
	controller: 'NU.controller.Behaviour',
	title: 'Behaviour',
	width: 800,
	height: 750,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [{
		itemId: 'table',
		xtype: 'grid',
		title: 'Action Table',
		flex: 1,
		store: 'test2',
		columns: [
			{text: 'Id', dataIndex: 'id'},
			{text: 'Name', dataIndex: 'name', flex: 1},
			{text: 'Priority', dataIndex: 'priority'}
		]
	}, {
		itemId: 'logs',
		xtype: 'grid',
		title: 'State log',
		flex: 1,
		store: 'test',
		columns: [
			{text: 'time', dataIndex: 'time'},
			{text: 'event', dataIndex: 'event', flex: 1}
		]
	}]
});
