Ext.define('NU.view.window.Chart', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_chart_window',
    requires: [
        'NU.view.window.ChartController',
        'Ext.ux.form.MultiSelect',
		'Ext.layout.container.Anchor',
        'NU.store.Streams',
		'Ext.tab.Panel'
	],
    controller: 'Chart',
	width: 640,
	height: 240,
	title: 'Chart Display',
	resizable: {
		preserveRatio: false
	},
	layout: 'border',
	listeners: {
		afterrender: 'onAfterRender',
		resize: 'onResize'
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
			fieldLabel: 'Min',
			labelStyle: 'white-space: nowrap',
			labelWidth: 30,
			width: 120,
			listeners: {
				change: 'onMinChange'
			}
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Max',
			labelStyle: 'white-space: nowrap',
			labelWidth: 30,
			width: 120,
			listeners: {
				change: 'onMaxChange'
			}
		}]
	},
	initComponent: function () {
		Ext.applyIf(this, {
			items: [{
				xtype: 'tabpanel',
				region: 'center',
				items: [{
					title: 'Streaming Line Chart',
					xtype: 'component',
					width: 320,
					height: 240,
					autoEl: {
						tag: 'canvas',
						width: 320,
						height: 240
					},
					reference: 'canvas',
					layout: 'fit'
				}, {
					title: '3D Rotation',
					xtype: 'component',
					width: 320,
					height: 240,
					reference: 'canvas3dContainer',
					layout: 'fit',
					listeners: {
						afterrender: 'onCanvas3dAfterRender'
					}
				}]
			}, {
				region: 'east',
				layout: 'fit',
				width: 150,
				items: [{
					xtype: 'multiselect',
					reference: 'streampicker',
					layout: 'fit',
					width: 148,
					scrollable: true,
					displayField: 'label',
					store: Ext.create('NU.store.Streams'),
					listeners: {
						change: 'onStreamSelect'
					}
				}]
			}]
		});

		return this.callParent(arguments);
	}
});
