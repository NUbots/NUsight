/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanel', {
	extend : 'Ext.panel.Panel',
	alias: 'widget.nu_dashboard_panel',
	requires: [
		'NU.view.dashboard.panel.title.Title',
		'NU.view.dashboard.panel.tool.Battery',
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
	style: {
		marginRight: '2px'
	},
	width: '30%',
	border: true,
	tools:[{
		xtype: 'container',
		layout: 'hbox',
		items: [{
			xtype: 'container',
			bind: {
				html: '{batteryPercentage}%'
			},
			style: {
				color: 'white'
			}
		}, {
			xtype: 'nu_tool_battery'
		}]
	}],
	items: [{
		xtype: 'nu_dashboard_panel_title',
		html: 'Localisation'
	}, {
		xtype: 'container',
		padding: 10,
		defaults: {
			xtype: 'container'
		},
		items: [{
			bind: {
				html: '<strong>Position:</strong> [{position.x}, {position.y}]'
			}
		}, {
			bind: {
				html: '<strong>Covariance:</strong> {covariance}'
			}
		}, {
			bind: {
				html: '<strong>Heading:</strong> {heading}&deg;'
			}
		}]
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Behaviour'
	}, {
		xtype: 'container',
		padding: 10,
		bind: {
			html: '<strong>Behaviour state:</strong> {state}'
		}
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Game controller'
	}, {
		xtype: 'container',
		padding: 10,
		defaults: {
			xtype: 'container'
		},
		items: [{
			bind: {
				html: '<strong>Mode:</strong> {mode}'
			}
		}, {
			bind: {
				html: '<strong>Phase:</strong> {phase}'
			}
		}, {
			bind: {
				html: '<strong>Penalty:</strong> {penalty}'
			}
		}]
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Hardware'
	}, {
		xtype: 'container',
		padding: 10,
		bind: {
			html: '<strong>Last camera image:</strong> {cameraImage}'
		}
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Vision'
	}, {
		xtype: 'container',
		padding: 10,
		defaults: {
			xtype: 'container'
		},
		items: [{
			bind: {
				html: '<strong>Last seen ball:</strong> {lastBall}'
			}
		}, {
			bind: {
				html: '<strong>Last seen goal:</strong> {lastGoal}'
			}
		}]
	}]
});
