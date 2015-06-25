Ext.define('NU.view.window.Subsumption', {
	extend : 'NU.view.window.Display',
	requires: [
		'NU.view.window.SubsumptionController',
		'NU.store.RegisterActionTree',
		'NU.store.ActionStateChange',
		'Ext.grid.Panel',
		'Ext.grid.column.Date'
	],
	alias : 'widget.nu_subsumption_window',
	controller: 'Subsumption',
	title: 'Subsumption',
	width: 800,
	height: 750,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	initComponent: function () {
		function getCellClass(value, state, index) {
			if (value.indexOf(index) >= 0) {
				if (state === API.ActionStateChange.State.START) {
					return 'action-start';
				} else {
					return 'action-kill';
				}
			} else {
				return '';
			}
		}
		Ext.apply(this, {
			tbar: [{
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
			}],
			items: [{
				reference: 'actions',
				xtype: 'treepanel',
				title: 'Action Table',
				flex: 1,
				store: Ext.create('NU.store.RegisterActionTree'),
				columns: [
					{text: 'Id', dataIndex: 'id'},
					{text: 'Name', dataIndex: 'name', flex: 1},
					{text: 'Priority', dataIndex: 'priority'}
				]
			}, {
				xtype: 'splitter'
			}, {
				reference: 'logs',
				xtype: 'grid',
				title: 'State log',
				flex: 1,
				store: Ext.create('NU.store.ActionStateChange'),
				columns: [
					{text: 'Time', dataIndex: 'time', xtype: 'datecolumn', format: 'H:i:s', width: 75},
					{text: 'State', dataIndex: 'state', renderer: function (value, metaData, record) {
						return record.getStateDescription()
					}},
					{text: 'Name', dataIndex: 'name'},
					{text: 'Left Leg', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						metaData.tdCls = metaData.tdCls + ' ' + getCellClass(value, record.get('state'), 0);
						return '';
					}},
					{text: 'Right Leg', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						metaData.tdCls = metaData.tdCls + ' ' + getCellClass(value, record.get('state'), 1);
						return '';
					}},
					{text: 'Left Arm', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						metaData.tdCls = metaData.tdCls + ' ' + getCellClass(value, record.get('state'), 2);
						return '';
					}},
					{text: 'Right Arm', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						metaData.tdCls = metaData.tdCls + ' ' + getCellClass(value, record.get('state'), 3);
						return '';
					}},
					{text: 'Head', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						metaData.tdCls = metaData.tdCls + ' ' + getCellClass(value, record.get('state'), 4);
						return '';
					}}
				]
			}]
		});

		return this.callParent(arguments);
	}
});
