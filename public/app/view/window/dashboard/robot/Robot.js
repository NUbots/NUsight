/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.dashboard.robot.Robot', {
	extend : 'Ext.panel.Panel',
	alias: 'widget.nu_robot',
	requires: [
		'NU.view.window.dashboard.robot.title.Title',
		'NU.view.window.dashboard.robot.RobotViewModel',
		'NU.view.window.dashboard.robot.RobotController'
	],
	config: {
		name: null
	},
	viewModel: {
		type: 'Robot'
	},
	controller: 'Robot',
	bind: {
		title: '{name}'
	},
	listeners: {
		update: 'onUpdate'
	},
	width: '30%',
	border: true,
	style: {
		marginRight: '2px'
	},
	defaults: {
		style: {
			padding: 10
		}
	},
	items: [{
		xtype: 'nu_title',
		html: 'Sensors',
	}, {
		xtype: 'container',
		layout: 'hbox',
		defaults: {
			xtype: 'container',
			flex: 1
		},
		items: [{
			bind: {
				html: '<strong>Voltage:</strong> {voltage}'
			}
		}, {
			bind: {
				html: '<strong>Battery:</strong> {battery}'
			}
		}]
	}, {
		xtype: 'container',
		bind: {
			html: '<strong>Behaviour state:</strong> {behaviourState}'
		}
	}]
	//items: [{
	//	xtype: 'grid',
	//	reference: 'grid',
	//	bind: {
	//		store: '{grid}'
	//	},
	//	columns: [{
	//		text: 'Robot',
	//		dataIndex: 'robotName'
	//	}, {
	//		xtype: 'numbercolumn',
	//		text: 'Voltage',
	//		dataIndex: 'voltage',
	//		format: '0.00'
	//	}, {
	//		xtype: 'numbercolumn',
	//		text: 'Battery',
	//		dataIndex: 'battery',
	//		// TODO: Fix hack
	//		format: '0.00%'
	//	}, {
	//		text: 'Behaviour state',
	//		dataIndex: 'behaviourState',
	//		width: 200
	//	}, {
	//		text: 'Robot position',
	//		dataIndex: 'robotPosition'
	//	}, {
	//		text: 'Robot heading',
	//		dataIndex: 'robotHeading'
	//	}]
	//}]
});
