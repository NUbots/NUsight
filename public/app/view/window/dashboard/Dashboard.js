/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.dashboard.Dashboard', {
	extend : 'NU.view.window.Display',
	alias: 'widget.nu_dashboard_window',
	requires: [
		'NU.view.window.dashboard.DashboardController'
	],
	controller: 'Dashboard',
	title: 'Dashboard',
	tbar: [],
	width: 1000,
	height: 350,
	layout: 'hbox'
});
