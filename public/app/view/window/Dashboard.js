/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.Dashboard', {
	extend : 'NU.view.window.Display',
	alias: 'widget.nu_dashboard_window',
	requires: [
		'Ext.grid.Panel',
		'Ext.grid.column.Number',
		'NU.view.window.DashboardViewModel',
		'NU.view.window.DashboardController'
	],
	viewModel: {
		type: 'Dashboard'
	},
	controller: 'Dashboard',
	title: 'Dashboard',
	width: 500,
	height: 350,
	items: [{
		xtype: 'grid',
		reference: 'dashboard',
		bind: {
			store: '{grid}'
		},
		columns: [{
			text: 'Robot',
			dataIndex: 'robotIP'
		}, {
			xtype: 'numbercolumn',
			text: 'Battery',
			dataIndex: 'battery',
			format: '0.00%'
		}]
	}]
});
