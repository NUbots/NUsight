Ext.define('NU.view.window.NetworkStatisticsRobotViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.NetworkStatisticsRobot',
	data: {
		name: ''
	},
	stores: {
		grid: {
			fields: [
				'type',
				'value'
			]
		}
	}
});
