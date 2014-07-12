Ext.define('NU.view.StatusBar', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.nu_statusbar',
	controller: 'NU.controller.StatusBar',
	defaults: {
//		flex: 1,
		data: {
			count: 0
		}
	},
	layout: {
		type: 'hbox',
		pack: 'end'
	},
	items: [{
		xtype: 'panel',
		itemId: 'packetCount',
		style: {
			textAlign: 'right'
		},
		tpl: 'Packet Count: {count}'
	}]
});
