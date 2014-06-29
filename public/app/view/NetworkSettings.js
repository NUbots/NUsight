Ext.define('NU.view.NetworkSettings', {
	extend: 'Ext.tab.Panel',
	requires: [
		'Ext.grid.Panel',
		'Ext.grid.column.CheckColumn'
//		'Ext.grid.plugin.RowEditing',
	],
	controller: 'NU.controller.NetworkSettings',
	alias: 'widget.networksettings',
//	inject: 'robotsStore',
//	config: {
//		robotsStore: null
//	},
	items: [{
		title: 'Reactions',
		xtype: 'gridpanel',
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
//	plugins: [{
//		ptype: 'rowediting',
//		pluginId: 'rowEditing'
//	}],
	}],
	initComponent: function () {

//		Ext.apply(this, {
//			store: this.getRobotsStore()
//		});

		this.callParent(arguments);
	}
});
