Ext.define("Ext.ux.ThreeJSWindow", {
	extend : 'Ext.Window',
	alias : ['widget.threejswindow'],
	items: [{
		xtype: 'component',
		itemId: 'domElementContainer'
	}]
});