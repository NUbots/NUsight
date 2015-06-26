/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanel', {
	extend : 'Ext.panel.Panel',
	alias: 'widget.nu_dashboard_panel',
	requires: [
		'NU.view.dashboard.panel.title.Title',
		'NU.view.dashboard.panel.DashboardPanelViewModel',
		'NU.view.dashboard.panel.DashboardPanelController'
	],
	config: {
		name: null
	},
	viewModel: {
		type: 'Robot'
	},
	controller: 'Robot',
	bind: {
		title: '{name}'
	},
	listeners: {
		update: 'onUpdate'
	},
	width: '30%',
	border: true,
	style: {
		marginRight: '2px'
	},
	defaults: {
		style: {
			padding: 10
		}
	},
	items: [{
		xtype: 'nu_dashboard_panel_title',
		html: 'Sensors'
	}, {
		xtype: 'container',
		layout: 'hbox',
		defaults: {
			xtype: 'container',
			flex: 1
		},
		items: [{
			bind: {
				html: '<strong>Voltage:</strong> {voltage}'
			}
		}, {
			bind: {
				html: '<strong>Battery:</strong> {battery}'
			}
		}]
	}, {
		xtype: 'container',
		bind: {
			html: '<strong>Behaviour state:</strong> {behaviourState}'
		}
	}, {
		xtype: 'container',
		layout: 'hbox',
		defaults: {
			xtype: 'container',
			flex: 1
		},
		items: [{
			bind: {
				html: '<strong>Position:</strong> {position}'
			}
		}, {
			bind: {
				html: '<strong>Heading:</strong> {heading}'
			}
		}]
	}]
});
