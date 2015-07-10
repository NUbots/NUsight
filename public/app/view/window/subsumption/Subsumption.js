Ext.define('NU.view.window.subsumption.Subsumption', {
	extend : 'NU.view.window.Display',
	requires: [
		'Ext.grid.Panel',
		'Ext.grid.column.Date',
		'NU.view.window.subsumption.SubsumptionViewModel',
		'NU.view.window.subsumption.SubsumptionController'
	],
	alias : 'widget.nu_subsumption_window',
	controller: 'Subsumption',
	viewModel: {
		type: 'Subsumption'
	},
	title: 'Subsumption',
	width: 800,
	height: 550,
	layout: {
		type: 'vbox',
		align: 'stretch'
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
		}, '->', {
			text: 'Clear Action Table',
			listeners: {
				click: 'onClearActionTable'
			}
		}, {
			text: 'Clear State Log',
			listeners: {
				click: 'onClearStateLog'
			}
		}]
	},
	items: [{
		xtype: 'grid',
		title: 'Action Table',
		flex: 1,
		bind: '{ActionRegister}',
		columns: [{
			text: 'Name',
			dataIndex: 'name',
			flex: 1
		}, {
			text: 'Left Leg',
			dataIndex: 'limbs',
			renderer: 'onRenderLeftLeg'
		}, {
			text: 'Right Leg',
			dataIndex: 'limbs',
			renderer: 'onRenderRightLeg'
		}, {
			text: 'Left Arm',
			dataIndex: 'limbs',
			renderer: 'onRenderLeftArm'
		}, {
			text: 'Right Arm',
			dataIndex: 'limbs',
			renderer: 'onRenderRightArm'
		}, {
			text: 'Head',
			dataIndex: 'limbs',
			renderer: 'onRenderHead'
		}, {
			text: 'Priority',
			dataIndex: 'priority'
		}]
	}, {
		xtype: 'splitter'
	}, {
		xtype: 'grid',
		title: 'State log',
		flex: 1,
		bind: '{ActionStateChange}',
		columns: [{
			text: 'Time',
			dataIndex: 'time',
			xtype: 'datecolumn',
			format: 'H:i:s',
			width: 75
		}, {
			text: 'State',
			dataIndex: 'state',
			renderer: 'onRenderState'
		}, {
			text: 'Name',
			dataIndex: 'name',
			flex: 1
		}, {
			text: 'Left Leg',
			dataIndex: 'limbs',
			renderer: 'onRenderLeftLeg'
		}, {
			text: 'Right Leg',
			dataIndex: 'limbs',
			renderer: 'onRenderRightLeg'
		},
		{
			text: 'Left Arm',
			dataIndex: 'limbs',
			renderer: 'onRenderLeftArm'
		}, {
			text: 'Right Arm',
			dataIndex: 'limbs',
			renderer: 'onRenderRightArm'
		}, {
			text: 'Head',
			dataIndex: 'limbs',
			renderer: 'onRenderHead'
		}]
	}]
});
