/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.Dashboard', {
	extend : 'Ext.Window',
	alias: 'widget.nu_dashboard_window',
	requires: [
		'Ext.layout.container.Column',
		'NU.view.dashboard.DashboardViewModel',
		'NU.view.dashboard.DashboardController'
	],
	viewModel: {
		type: 'Dashboard'
	},
	controller: 'Dashboard',
	title: 'Dashboard',
	autoShow: true,
	constrain: true,
	maximizable: true,
	width: 1000,
	height: 550,
	autoScroll: true,
	listeners: {
		maximize: 'onMaximize'
	},
	layout: {
		type: 'column',
		align: 'stretch'
	},
	tools: [{
		xtype: 'button',
		text: 'Toggle localisation',
		handler: 'onToggle'
	}, {
		bind: {
			type: '{record}',
			tooltip: '{recordTooltip}'
		},
		callback: 'onRecord'
	}]
});
