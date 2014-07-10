Ext.define('NU.view.window.Field', {
	extend : 'NU.view.window.Display',
	alias : ['widget.nu_field_window'],
	requires: [
		'NU.view.field.Robot',
		'NU.view.robot.Selector'
	],
	controller: 'NU.controller.Field',
	title: 'Localisation Display',
	width: 800,
	height: 400,
	layout: 'fit',
	tbar:  [{
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
			}]
		}
	}],
	items: [{
		xtype: 'threejs',
		itemId: 'mainscene'
	}]
});
