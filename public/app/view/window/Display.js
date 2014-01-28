Ext.define('NU.view.window.Display', {
	extend : 'Ext.Window',
	alias : ['widget.nu.display_window'],
	itemId: "display_window",
	constrain: true,
    autoShow: true,
	tbar: [{
		itemId: 'robotIP',
		fieldLabel: 'Robot',
		labelWidth: 40,
		xtype: 'combo',
		queryMode: 'local',
		forceSelection: true,
		editable: false,
		displayField: 'ipAddress',
		valueField: 'ipAddress',
        emptyText: 'No Robot Selected',
		store: 'Robots'
	}]
});