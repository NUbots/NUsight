Ext.define('NU.view.LayeredCanvas', {
	extend: 'Ext.container.Container',
	alias: 'widget.nu_layered_canvas',
	requires: 'NU.controller.LayeredCanvas',
	controller: 'LayeredCanvas',
	autoEl: {
		tag: 'div'
	},
	style: {
		position: 'relative',
		display: 'block'
	},
	layout: 'fit',
	listeners: {
		afterrender: 'onAfterRender'
	}
});