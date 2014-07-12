Ext.define('NU.view.StatusBar', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.nu_statusbar',
	controller: 'NU.controller.StatusBar',
	items: ['->', {
		xtype: 'container',
		html: 'Server: X'
	}, {
		xtype: 'container',
		html: 'Robot #1: X'
	}, {
		xtype: 'container',
		html: 'Robot #2: X'
	}, {
		xtype: 'container',
		html: 'Robot #3: X'
	}]
});
