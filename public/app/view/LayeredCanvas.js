Ext.define('NU.view.LayeredCanvas', {
	extend: 'Ext.container.Container',
	alias: 'widget.nu_layered_canvas',
	controller: 'NU.controller.LayeredCanvas',
	autoEl: {
		tag: 'div'
	},
	style: {
		position: 'relative'
	},
	layout: 'fit'
});