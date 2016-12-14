Ext.define('NU.view.window.ScatterPlot', {
	id: 'scatterPlotWindow',
	extend : 'NU.view.window.Display',
	alias: 'widget.nu_scatterplot_window',
	requires: [
		'NU.view.window.ScatterPlotController',
		'Ext.ux.form.MultiSelect',
		'Ext.layout.container.Anchor',
		'NU.store.Streams'
	],
	controller: 'ScatterPlot',
	width: 720,
	height: 240,
	title: 'Scatter Plot Display',
	resizable: {
		preserveRatio: false
	},
	layout: 'border',
	listeners: {
		afterrender: 'onAfterRender',
		resize: 'onResize'
	},
	//right toolbar for configs for traces
	rbar: {
		id: 'rightbar',
		xtype: 'toolbar',
		width: 150,
		layout: {
			overflowHandler: 'scroller'
		},
		items: [
		],
	},
	tbar: {
		xtype: 'toolbar',
		layout: {
			overflowHandler: 'Menu'
		},
		items: [{
			xtype: 'robot_selector',
			listeners: {
				selectRobot: 'onSelectRobot'
			}
		}, {
			xtype: 'numberfield',
			fieldLabel: 'X Min',
			labelStyle: 'white-space: nowrap',
			labelWidth: 35,
			width: 100,
			listeners: {
				change: 'onXMinChange'
			}
		}, {
			xtype: 'numberfield',
			fieldLabel: 'X Max',
			labelStyle: 'white-space: nowrap',
			labelWidth: 35,
			width: 100,
			listeners: {
				change: 'onXMaxChange'
			}
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Y Min',
			labelStyle: 'white-space: nowrap',
			labelWidth: 35,
			width: 100,
			listeners: {
				change: 'onYMinChange'
			}
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Y Max',
			labelStyle: 'white-space: nowrap',
			labelWidth: 35,
			width: 100,
			listeners: {
				change: 'onYMaxChange'
			}
		},{
			xtype: 'numberfield',
			fieldLabel: 'Max Points',
			labelStyle: 'white-space: nowrap',
			labelWidth: 70,
			width: 150,
			value: 100,
			listeners: {
				change: 'onPointsChange'
			}
		}, {
			xtype: 'numberfield',
			reference: 'offset',
			fieldLabel: 'Offset (ms)',
			labelStyle: 'white-space: nowrap',
			labelWidth: 70,
			width: 150,
			value: 0,
			readOnly: true,
			disabled: true
		}, {
			xtype: 'button',
			text: 'Pause',
			handler: 'onPause',
			reference: 'pause'
		}, '->', {
			text: 'Graph Type',
			menu: [{
				xtype: 'radiogroup',
				columns: 1,
				vertical: true,
				items: [{
					checked: true,
					boxLabel: '2D Scatter Plot',
					name: 'graphType',
					inputValue: '2D Scatter Plot',
					listeners: {
						change: 'onGraphTypeChange'
					},
					type: 'scattergl' //Plotly's Graph Type
				}, {
					boxLabel: '3D Scatter Plot',
					name: 'graphType',
					inputValue: '3D Scatter Plot',
					listeners: {
						change: 'onGraphTypeChange'
					},
					type: 'scatter3d'
				}, {
                    boxLabel: 'Heatmap',
                    name: 'graphType',
                    inputValue: 'Heatmap',
                    listeners: {
                        change: 'onGraphTypeChange'
                    },
                    type: 'heatmapgl'
                }]
			}]
		}]
	},
	initComponent: function () {
		Ext.applyIf(this, {
			items: [{
				xtype: 'component',
				region: 'center',
				width: 470,
				height: 240,
				autoEl: {
					tag: 'div',
					width: 320,
					height: 240
				},
				style: {
					backgroundColor: '#FFFFFF'
				},
				reference: 'scatter',
				layout: 'fit'
			}]
		});

		return this.callParent(arguments);
	}
});
