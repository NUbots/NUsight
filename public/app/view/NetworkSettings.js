Ext.define('NU.view.NetworkSettings', {
	extend: 'Ext.tab.Panel',
	requires: [
		'NU.view.robot.List',
		'Ext.grid.Panel',
		'Ext.grid.column.CheckColumn'
	],
	controller: 'NU.controller.NetworkSettings',
	alias: 'widget.networksettings',
	inject: 'reactionHandlersStore',
	config: {
		reactionHandlersStore: null
	},
	initComponent: function () {

		Ext.apply(this, {
			items: [{
				title: 'Robots',
				xtype: 'robotlist'
			}, {
				title: 'Reactions',
				xtype: 'gridpanel',
				itemId: 'grid',
				store: this.getReactionHandlersStore(),
				tbar: [{
					xtype: 'checkbox',
					fieldLabel: 'Manage Automatically',
					labelWidth: 150,
					checked: false,
					disabled: true
				}, '->', {
					text: 'Save',
					itemId: 'save'
				}],
				columns: [{
					header: 'Name',
					width: 170,
					dataIndex: 'name',
					editor: 'textfield'
				}, {
					header: 'Enabled',
					xtype: 'checkcolumn',
					flex: 1,
					dataIndex: 'enabled'
				}]
			}]
		});

		this.callParent(arguments);
	}
});
