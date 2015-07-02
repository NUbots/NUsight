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
	width: '100%',
	height: 100,
	layout: 'fit',
	style: {
		background: 'url("../resources/images/field.png") no-repeat',
		backgroundSize: '100% 100%'
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
