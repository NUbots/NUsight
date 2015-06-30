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
		colors: null
	},
	viewModel: {
		type: 'DashboardPanel'
	},
	controller: 'DashboardPanel',
	bind: {
		title: '{name} - <span style="color:{penaltyColor}">{penalty}</span>'
	},
	listeners: {
		destroy: 'onDestroy',
		update: 'onUpdate'
	},
	style: {
		marginRight: '2px'
	},
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	columnWidth: 0.33,
	border: true,
	tools:[{
		xtype: 'container',
		layout: 'hbox',
		items: [{
			xtype: 'container',
			bind: {
				html: '{batteryPercentage}%',
				style: {
					color: '{batteryColor}'
				}
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
			xtype: 'container',
			layout: 'hbox',
			style: {
				background: '{positionBackground}',
				color: '{positionColor}'
			},
			defaults: {
				xtype: 'container'
			},
			items: [{
				bind: {
					html: '<strong>Robot position:</strong> [{position.x}, {position.y}]'
				},
				style: {
					marginRight: '5px'
				}
			}, {
				bind: {
					html: '<strong>Heading:</strong> {heading}&deg;'
				}
			}]
		}, {
			bind: {
				html: '<strong>Covariance:</strong> {covariance.x.x}, {covariance.x.y}, {covariance.y.y}'
			}
		}, {
			bind: {
				html: '<strong>Ball position:</strong> [{position.x}, {position.y}]'
			}
		}]
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Behaviour'
	}, {
		xtype: 'container',
		defaults: {
			xtype: 'container',
			padding: '5px 10px 5px 10px'
		},
		items: [{
			bind: {
				html: '<strong>Behaviour:</strong> {state}'
			}
		}, {
			bind: {
				html: '<strong>State:</strong> {mode}, {phase}'
			}
		}]
	}, {
		xtype: 'nu_dashboard_panel_title',
		html: 'Last seen'
	}, {
		xtype: 'container',
		defaults: {
			xtype: 'container',
			padding: '5px 10px 5px 10px'
		},
		items: [{
			bind: {
				html: '<strong>Camera image:</strong> {cameraImage}',
				style: {
					background: '{lastCameraBackground}',
					color: '{lastCameraColor}'
				}
			}
		}, {
			bind: {
				html: '<strong>Ball:</strong> {lastBall}',
				style: {
					background: '{lastBallBackground}',
					color: '{lastBallColor}'
				}
			}
		}, {
			bind: {
				html: '<strong>Goal:</strong> {lastGoal}',
				style: {
					background: '{lastGoalBackground}',
					color: '{lastGoalColor}'
				}
			}
		}]
	}]
});
