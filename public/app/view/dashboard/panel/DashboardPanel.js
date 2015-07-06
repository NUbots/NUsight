/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanel', {
	extend : 'Ext.panel.Panel',
	alias: 'widget.nu_dashboard_panel',
	requires: [
		'NU.view.dashboard.panel.title.Title',
		'NU.view.dashboard.panel.tool.Battery',
		'NU.view.dashboard.panel.tool.Packet',
		'NU.view.dashboard.panel.field.Field',
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
		title: '{name} - {role}',
		style: {
			background: '{maskBackground}',
			opacity: '{maskOpacity}',
			marginRight: '2px'
		}
	},
	listeners: {
		destroy: 'onDestroy',
		update: 'onUpdate',
		toggleLocalisation: 'onToggleLocalisation'
	},
	cls: 'dashboard-panel',
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
	}, {
		xtype: 'nu_tool_packet',
		bind: {
			style: {
				backgroundColor: '{elapsedBackground}'
			}
		}
	}],
	items: [
	/*{
	 xtype: 'nu_dashboard_panel_title',
	 html: 'Robot Localisation'
	 }, */{
		xtype: 'container',
		bind: {
			hidden: '{localisation}'
		},
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
					html: '<strong>Position:</strong> [{position.x}, {position.y}]'
				},
				style: {
					marginRight: '5px'
				}
			}, {
				bind: {
					html: '<strong>Angle:</strong> {heading}&deg;'
				}
			}]
		}, {
			bind: {
				html: '<strong>Cov:</strong> {covariance.xx}, {covariance.xy}, {covariance.yy}'
			}
		}, {
			bind: {
				html: '<strong>Ball position:</strong> [{ball.x}, {ball.y}]'
			}
		}]
	}, {
		xtype: 'nu_dashboard_panel_field',
		reference: 'field',
		bind: {
			hidden: '{!localisation}'
		}
	}, /*{
	 xtype: 'nu_dashboard_panel_title',
	 html: 'Behaviour'
	 }, */{
		xtype: 'container',
		defaults: {
			xtype: 'container',
			padding: '5px 10px 5px 10px'
		},
		items: [{
			bind: {
				html: '<strong>GameController:</strong> {phase} ({mode})'
			}
		}, {
			bind: {
				html: '<strong>Behaviour:</strong> {state}'
			}
		}, {
			bind: {
				html:  '<strong>Penalty:</strong> {penalty}',
				style: {
					backgroundColor: '{penaltyBackground}',
					color: '{penaltyColor}'
				}

			}
		}]
	}, /*{
	 xtype: 'nu_dashboard_panel_title',
	 html: 'Last seen'
	 }, */{
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
