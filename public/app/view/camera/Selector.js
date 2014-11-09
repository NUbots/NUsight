Ext.define('NU.view.camera.Selector', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.camera_selector',
	requires: 'NU.controller.camera.Selector',
	controller: 'CameraSelector',
	itemId: 'cameraSelector',
	fieldLabel: 'Camera',
	labelWidth: 50,
	queryMode: 'local',
	forceSelection: true,
	editable: false,
	displayField: 'name',
	valueField: 'id',
	emptyText: 'No Camera Selected',
	store: 'Camera',
	listeners: {
		select: 'onSelectCamera'
	}
});
