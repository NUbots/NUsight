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
		if (recordSelected !== undefined) {
			// select record
			combo.select(recordSelected, true);
		}
	},
	onSelectCamera: function (combo, records, eOpts) {
		// might not be an array, so make it an array
		if (!Array.isArray(records)) {
			records = [records];
		}
		// get the first camera id
		var cameraId = records[0].get('id');
		// set the camera id
		this.setCameraId(cameraId);
		// fire event
		combo.fireEvent('selectCamera', cameraId);
	}
});
