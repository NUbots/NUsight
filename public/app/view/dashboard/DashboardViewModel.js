Ext.define('NU.view.dashboard.DashboardViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Dashboard',
	data: {
		recording: null
	},
	formulas: {
		record: function (get) {
			var recording = get('recording');
			return recording ? 'stop-recording' : 'start-recording';
		},
		recordTooltip: function (get) {
			var recording = get('recording');
			return recording ? 'Stop recording enabled robots' : 'Start recording enabled robots';
		}
	}
});
