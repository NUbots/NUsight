Ext.define('NU.view.window.Chart', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_chart_window',
    requires: [
        'NU.view.window.ChartController',
        'Ext.ux.form.MultiSelect',
		'Ext.layout.container.Anchor',
        'NU.store.Streams'
	],
    controller: 'Chart',
	width: 720,
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
			width: 100,
			listeners: {
				change: 'onMinChange'
			}
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Max',
			labelStyle: 'white-space: nowrap',
			labelWidth: 30,
			width: 100,
			listeners: {
				change: 'onMaxChange'
			}
		}, {
			xtype: 'numberfield',
			reference: 'period',
			fieldLabel: 'Seconds',
			labelStyle: 'white-space: nowrap',
			labelWidth: 55,
			width: 100,
			listeners: {
				change: 'onPeriodChange'
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
			handler: 'onPause'
		}]
	},
	initComponent: function () {
		Ext.applyIf(this, {
			items: [{
				xtype: 'component',
				region: 'center',
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
				region: 'east',
				layout: 'fit',
				width: 150,
				items: [{
					xtype: 'multiselect',
					reference: 'streampicker',
					width: 148,
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
