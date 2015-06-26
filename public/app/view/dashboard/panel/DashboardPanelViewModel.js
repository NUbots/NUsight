/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanelViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Robot',
	data: {
		name: '',
		voltage: 0,
		battery: 0,
		behaviourState: 0,
		position: 0,
		heading: 0
	}
});