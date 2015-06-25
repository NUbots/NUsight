/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.NetworkStatisticsRobot', {
	extend : 'Ext.grid.Panel',
	requires: [
		'Ext.grid.Panel',
		'NU.view.window.NetworkStatisticsRobotController',
		'NU.view.window.NetworkStatisticsRobotViewModel'
	],
	flex: 0.3,
	layout: 'fit',
	config: {
		robot: null
	},
	viewModel: {
		type: 'NetworkStatisticsRobot'
	},
	controller: 'NetworkStatisticsRobot',
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
