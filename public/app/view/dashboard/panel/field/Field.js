/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.field.Field', {
	extend: 'Ext.Container',
	alias: 'widget.nu_dashboard_panel_field',
	requires: [
		'Ext.layout.container.Fit',
		'NU.view.dashboard.panel.field.FieldController'
	],
	controller: 'DashboardPanelField',
	height: 100,
	layout: 'fit',
	style: {
		background: '#009900'
	},
	listeners: {
		afterRender: 'onAfterRender',
		resize: 'onResize',
		update: 'onUpdate'
	},
	items: [{
		xtype: 'component',
		reference: 'canvas',
		autoEl: {
			tag: 'canvas'
		}
	}]
});
