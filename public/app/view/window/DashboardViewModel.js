Ext.define('NU.view.window.DashboardViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Dashboard',
	stores: {
		grid: {
			fields: [
				'robotName',
				'voltage',
				'battery',
				'behaviourState',
				'robotPosition',
				'robotHeading'
			]
		}
	}
});