Ext.define('NU.view.window.Behaviour', {
	extend : 'NU.view.window.Display',
	requires: [
		'NU.controller.Behaviour',
		'NU.store.RegisterActionTree',
		'NU.store.ActionStateChange',
		'Ext.grid.Panel',
		'Ext.grid.column.Date'
	],
	alias : 'widget.nu_behaviour_window',
	controller: 'Behaviour',
	title: 'Behaviour',
	width: 800,
	height: 750,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	initComponent: function () {
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
				/*viewConfig: {
					getRowClass: function (record) {
						if (record.get('state') === API.ActionStateChange.State.START) {
							return 'action-start';
						} else {
							return 'action-kill';
						}
					}
				},*/
				columns: [
					{text: 'Time', dataIndex: 'time', xtype: 'datecolumn', format: 'H:i:s', width: 75},
					{text: 'State', dataIndex: 'state', renderer: function (value, metaData, record) {
						return record.getStateDescription()
					}},
					{text: 'Name', dataIndex: 'name'},
					{text: 'Left Leg', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						if (value.indexOf(0) >= 0) {
							if (record.get('state') === API.ActionStateChange.State.START) {
								metaData.tdCls = metaData.tdCls + " action-start";
							} else {
								metaData.tdCls = metaData.tdCls + " action-kill";
							}
						}
						return '';
					}},
					{text: 'Right Leg', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						if (value.indexOf(1) >= 0) {
							if (record.get('state') === API.ActionStateChange.State.START) {
								metaData.tdCls = metaData.tdCls + " action-start";
							} else {
								metaData.tdCls = metaData.tdCls + " action-kill";
							}
						}
						return '';
					}},
					{text: 'Left Arm', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						if (value.indexOf(2) >= 0) {
							if (record.get('state') === API.ActionStateChange.State.START) {
								metaData.tdCls = metaData.tdCls + " action-start";
							} else {
								metaData.tdCls = metaData.tdCls + " action-kill";
							}
						}
						return '';
					}},
					{text: 'Right Arm', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						if (value.indexOf(3) >= 0) {
							if (record.get('state') === API.ActionStateChange.State.START) {
								metaData.tdCls = metaData.tdCls + " action-start";
							} else {
								metaData.tdCls = metaData.tdCls + " action-kill";
							}
						}
						return '';
					}},
					{text: 'Head', dataIndex: 'limbs', renderer: function (value, metaData, record) {
						if (value.indexOf(4) >= 0) {
							if (record.get('state') === API.ActionStateChange.State.START) {
								metaData.tdCls = metaData.tdCls + " action-start";
							} else {
								metaData.tdCls = metaData.tdCls + " action-kill";
							}
						}
						return '';
					}}
				]
			}]
		});

		return this.callParent(arguments);
	}
});
