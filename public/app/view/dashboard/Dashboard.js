/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.Dashboard', {
	extend : 'Ext.Window',
	alias: 'widget.nu_dashboard_window',
	requires: [
		'NU.view.dashboard.DashboardController'
	],
	controller: 'Dashboard',
	title: 'Dashboard',
	autoShow: true,
	constrain: true,
	maximizable: true,
	width: 1000,
	height: 550,
	layout: 'hbox'
});
