Ext.define('NU.view.camera.Selector', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.camera_selector',
	requires: 'NU.view.camera.SelectorController',
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
