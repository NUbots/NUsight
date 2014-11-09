Ext.define('NU.view.window.Chart', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_chart_window',
    requires: [
        'NU.controller.Chart',
        'Ext.ux.form.MultiSelect',
		'Ext.layout.container.Anchor',
        'NU.store.Streams'
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
	tbar: [{
		xtype: 'robot_selector'
	}, {
		xtype: 'numberfield',
		itemId: 'min',
		fieldLabel: 'Min',
		labelStyle: 'white-space: nowrap',
		labelWidth: 30,
		width: 120,
		listeners: {
			change: 'onMinChange'
		}
	}, {
		xtype: 'numberfield',
		itemId: 'max',
		fieldLabel: 'Max',
		labelStyle: 'white-space: nowrap',
		labelWidth: 30,
		width: 120,
		listeners: {
			change: 'onMaxChange'
		}
	}],
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
				width: 150,
				items: [{
					xtype: 'multiselect',
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
