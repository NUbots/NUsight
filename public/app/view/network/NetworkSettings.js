Ext.define('NU.view.network.NetworkSettings', {
	extend: 'Ext.tab.Panel',
	requires: [
		'Ext.grid.Panel',
		'Ext.grid.column.CheckColumn',
		'NU.view.robot.List',
		'NU.view.network.statistics.NetworkStatistics',
		'NU.view.network.NetworkSettingsController'
	],
	controller: 'NetworkSettings',
	alias: 'widget.networksettings',
	inject: 'reactionHandlesStore',
	config: {
		reactionHandlesStore: null
	},
	items: [{
		title: 'Robots',
		xtype: 'robotlist'
	}, {
		title: 'Reactions',
		xtype: 'gridpanel',
		reference: 'grid',
		store: 'ReactionHandles',
		tbar: [{
			xtype: 'checkbox',
			fieldLabel: 'Manage Automatically',
			labelWidth: 150,
			checked: false,
			disabled: true
		}, '->', {
			text: 'Save',
			listeners: {
				click: 'onSave'
			}
		}],
		columns: [{
			header: 'Name',
			width: 170,
			dataIndex: 'name',
			editor: 'textfield'
		}, {
			header: 'Enabled',
			xtype: 'checkcolumn',
			flex: 1,
			dataIndex: 'enabled'
		}]
	}, {
		xtype: 'nu_network_statistics_panel'
	}]
});
