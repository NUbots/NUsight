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
		name: null,
		colors: {
			OKAY: 'green',
			WARNING: 'orange',
			DANGER: 'red'
		}
	},
	viewModel: {
		type: 'DashboardPanel'
	},
	controller: 'DashboardPanel',
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
		defaults: {
			xtype: 'container',
			padding: '5px 10px 5px 10px'
		},
		items: [{
			bind: {
				html: '<strong>Position:</strong> [{position.x}, {position.y}]',
				style: {
					background: '{positionBackground}',
					color: 'white'
				}
			}
		}, {
			bind: {
				html: '<strong>Covariance:</strong> {covariance.x.x}, {covariance.x.y}, {covariance.y.y}'
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
		padding: '5px 10px 5px 10px',
		bind: {
			html: '<strong>Behaviour state:</strong> {state}'
		}
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Game controller'
	}, {
		xtype: 'container',
		defaults: {
			xtype: 'container',
			padding: '5px 10px 5px 10px'
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
				html: '<strong>Penalty:</strong> {penalty}',
				style: {
					background: '{penaltyBackground}',
					color: 'white'
				}
			}
		}]
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Hardware'
	}, {
		xtype: 'container',
		padding: '5px 10px 5px 10px',
		bind: {
			html: '<strong>Last camera image:</strong> {cameraImage}',
			style: {
				background: '{lastCameraBackground}',
				color: 'white'
			}
		}
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Vision'
	}, {
		xtype: 'container',
		defaults: {
			xtype: 'container',
			padding: '5px 10px 5px 10px'
		},
		items: [{
			bind: {
				html: '<strong>Last seen ball:</strong> {lastBall}',
				style: {
					background: '{lastBallBackground}',
					color: 'white'
				}
			}
		}, {
			bind: {
				html: '<strong>Last seen goal:</strong> {lastGoal}',
				style: {
					background: '{lastGoalBackground}',
					color: 'white'
				}
			}
		}]
	}]
});
