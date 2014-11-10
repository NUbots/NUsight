Ext.define('NU.view.window.Field', {
	extend: 'NU.view.window.Display',
	alias: 'widget.nu_field_window',
	requires: [
		'NU.controller.Field',
		'NU.view.field.Robot',
		'NU.view.robot.Selector',
		'Ext.form.field.Checkbox'
	],
	controller: 'Field',
	title: 'Localisation Display',
	width: 800,
	height: 400,
	layout: 'fit',
	listeners: {
		afterrender: 'onAfterRender'
	},
	tbar: [{
		xtype: 'robot_selector'
	}, {
		itemId: 'hawkeye',
		text: 'HawkEye'
	},/*, {
	 itemId: 'perspective',
	 text: 'Perspective'
	 }, {
	 itemId: 'side',
	 text: 'Side'
	 },*/ {
		itemId: 'close_front',
		text: 'Close Front'
	}, {
		itemId: 'close_angle',
		text: 'Close Angle'
	}, {
		itemId: 'close_side',
		text: 'Close Side'
	}, '->', {
		text: 'Extra',
		menu: {
			items: [{
				itemId: 'orientation',
				xtype: 'checkbox',
				fieldLabel: 'Orientation',
				checked: false
			}, {
				itemId: 'resetOrientation',
				text: 'Reset Orientation',
				ui: 'default-toolbar'
			}, {
				itemId: 'anaglyph',
				xtype: 'checkbox',
				fieldLabel: 'Anaglyph'
			}, {
				itemId: 'gamepad',
				xtype: 'checkbox',
				fieldLabel: 'Gamepad'
			}, {
				itemId: 'inverted',
				xtype: 'checkbox',
				fieldLabel: 'Inverted',
				checked: true
			},  {
				itemId: 'displayCrosshair',
				xtype: 'checkbox',
				fieldLabel: 'Crosshair',
				checked: true
			}]
		}
	}],
    bbar: [{
        xtype: 'component',
        reference: 'coordinates',
        height: 15,
        tpl: 'X: {x}, Y: {y}, Z: {z}',
        data: {
            x: 0,
            y: 0,
            z: 0
        }
    }],
	items: [{
		xtype: 'threejs',
		reference: 'mainscene'
	}]
});
