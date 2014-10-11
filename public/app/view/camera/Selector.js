Ext.define('NU.view.camera.Selector', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.camera_selector',
	controller: 'NU.controller.camera.Selector',
	inject:  'cameraStore',
	config: {
		cameraStore: null
	},
	itemId: 'cameraSelector',
	initComponent: function () {
		Ext.apply(this, {
			fieldLabel: 'Camera',
			labelWidth: 50,
			queryMode: 'local',
			forceSelection: true,
			editable: false,
			displayField: 'name',
			valueField: 'id',
			emptyText: 'No Camera Selected',
			store: this.getCameraStore()
		});

		this.callParent(arguments);
	}
});
