Ext.define('NU.view.window.Behaviour', {
	extend : 'NU.view.window.Display',
	inject: [
		'actionStateChangeStore',
		'registerActionTreeStore'
	],
	config: {
		actionStateChangeStore: null,
		registerActionTreeStore: null
	},
	alias : ['widget.nu_behaviour_window'],
	controller: 'NU.controller.Behaviour',
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
				xtype: 'robot_selector'
			}, '->', {
				itemId: 'clearActionTable',
				text: 'Clear Action Table'
			}, {
				itemId: 'clearStateLog',
				text: 'Clear State Log'
			}],
			items: [{
				itemId: 'actions',
				xtype: 'treepanel',
				title: 'Action Table',
				flex: 1,
				store: this.getRegisterActionTreeStore(),
				columns: [
					{text: 'Id', dataIndex: 'id'},
					{text: 'Name', dataIndex: 'name', flex: 1},
					{text: 'Priority', dataIndex: 'priority'}
				]
			}, {
				xtype: 'splitter'
			}, {
				itemId: 'logs',
				xtype: 'grid',
				title: 'State log',
				flex: 1,
				store: this.getActionStateChangeStore(),
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