Ext.define('NU.view.window.DashboardViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Dashboard',
	stores: {
		grid: {
			fields: [
				'robotIP',
				'battery'//,
				//'ping',
				//'sensorData',
				//'image',
				//'classifiedImage',
				//'visionObject',
				//'localisation',
				//'dataPoint',
				//'drawObjects',
				//'reactionStatistics',
				//'lookupTable',
				//'lookupTableDiff',
				//'behaviour',
				//'command',
				//'reactionHandles',
				//'gameState',
				//'configurationState'
			]
		}
	}
});