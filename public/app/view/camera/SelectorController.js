Ext.define('NU.view.camera.SelectorController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.CameraSelector',
	config: {
		cameraId: null
	},
	init: function () {
		// select first value by default
		var combo = this.getView();
		var recordSelected = combo.getStore().getAt(0);
		// check if exists
		if (recordSelected) {
            combo.select(recordSelected, true);
		}
	},
	onSelectCamera: function (combo, record, eOpts) {
		// get the first camera id
		var cameraId = record.get('id');
		// set the camera id
		this.setCameraId(cameraId);
		// fire event
		combo.fireEvent('selectCamera', cameraId);
	}
});
