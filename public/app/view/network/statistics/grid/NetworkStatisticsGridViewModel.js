Ext.define('NU.view.network.statistics.grid.NetworkStatisticsGridViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.NetworkStatisticsGrid',
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
