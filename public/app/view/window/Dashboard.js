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
	tbar: [],
	width: 1000,
	height: 350,
	items: [{
		xtype: 'grid',
		reference: 'grid',
		bind: {
			store: '{grid}'
		},
		columns: [{
			text: 'Robot',
			dataIndex: 'robotName'
		}, {
			xtype: 'numbercolumn',
			text: 'Voltage',
			dataIndex: 'voltage',
			format: '0.00'
		}, {
			xtype: 'numbercolumn',
			text: 'Battery',
			dataIndex: 'battery',
			// TODO: Fix hack
			format: '0.00%'
		}, {
			text: 'Behaviour state',
			dataIndex: 'behaviourState',
			width: 200
		}, {
			text: 'Robot position',
			dataIndex: 'robotPosition'
		}, {
			text: 'Robot heading',
			dataIndex: 'robotHeading'
		}]
	}]
});
