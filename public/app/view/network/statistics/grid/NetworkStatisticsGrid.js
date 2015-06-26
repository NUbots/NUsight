/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.statistics.grid.NetworkStatisticsGrid', {
	extend : 'Ext.grid.Panel',
	alias: 'widget.nu_network_statistics_grid_panel',
	requires: [
		'Ext.grid.Panel',
		'NU.view.network.statistics.grid.NetworkStatisticsGridController',
		'NU.view.network.statistics.grid.NetworkStatisticsGridViewModel'
	],
	flex: 0.3,
	layout: 'fit',
	config: {
		robot: null
	},
	viewModel: {
		type: 'NetworkStatisticsGrid'
	},
	controller: 'NetworkStatisticsGrid',
	bind: {
		title: '{name}',
		store: '{grid}'
	},
	listeners: {
		update: 'onUpdate'
	},
	hideHeaders: true,
	columns: [{
		dataIndex: 'type',
		flex: 1
	}, {
		dataIndex: 'value'
	}]
});
