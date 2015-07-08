/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.reactions.grid.Grid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.nu_network_reactions_grid_panel',
	requires: [
		'Ext.grid.Panel',
		'Ext.grid.column.CheckColumn',
		'NU.view.network.reactions.grid.GridController',
		'NU.view.network.reactions.grid.GridViewModel'
	],
	width: '33%',
	layout: 'fit',
	config: {
		robot: null
	},
	viewModel: {
		type: 'NetworkReactionsGrid'
	},
	controller: 'NetworkReactionsGrid',
	bind: {
		title: '{name}',
		store: '{grid}'
	},
	listeners: {
		update: 'onUpdate'
	},
	hideHeaders: true,
	columns: [{
		dataIndex: 'name',
		flex: 1
	}, {
		dataIndex: 'packets',
		width: 80
	}, {
		xtype: 'checkcolumn',
		dataIndex: 'enabled',
		width: 30,
		listeners: {
			checkChange: 'onCheckChange'
		}
	}]
});
