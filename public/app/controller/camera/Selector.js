Ext.define('NU.controller.camera.Selector', {
	extend: 'Deft.mvc.ViewController',
	requires: 'NU.util.Network',
	inject:  'cameraStore',
	config: {
		cameraId: null,
		cameraStore: null
	},
	control: {
		'view': {
			select: function (combo, records, eOpts) {
				var cameraId = records[0].get('id');
				this.setCameraId(cameraId);
				setTimeout(function () { // hack to allow live selectors to have attached
					combo.fireEvent('selectCameraId', cameraId);
				}, 1);
			}
		}
	},
	init: function () {
		// select first value by default
		var combo = this.getView();
		var recordSelected = combo.getStore().getAt(0);
		if (recordSelected) {
			combo.select(recordSelected, true);
			combo.fireEvent('select', combo, [recordSelected]);
		}
	}
});
