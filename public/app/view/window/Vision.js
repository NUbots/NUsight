Ext.define('NU.view.window.Vision', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_vision_window'],
    requires: [
        'NU.view.window.VisionController',
		'Ext.ux.form.MultiSelect',
		'NU.view.LayeredCanvas',
		'NU.view.camera.Selector',
        'Ext.layout.container.Anchor'
	],
    controller: 'Vision',
    title: 'Vision Display',
    width: 454,
    height: 295,
//    resizable: {
//        preserveRatio: true
//    },
    layout: 'border',
    listeners: {
        afterrender: 'onAfterRender'
    },
	tbar: [{
		xtype: 'robot_selector',
        listeners: {
            selectRobot: 'onSelectRobot'
        }
	}, {
		xtype: 'camera_selector',
        listeners: {
            selectCamera: 'onSelectCamera'
        }
	}],
    items: [{
        xtype: 'nu_layered_canvas',
        region: 'center',
        width: 320,
        height: 240,
        style: {
            backgroundColor: '#000'
//            backgroundImage: "url('resources/images/camera.png')",
//            backgroundRepeat: 'no-repeat',
//            backgroundPosition: 'center'
        },
        reference: 'canvas'
    }, {
        region: 'east',
        layout: 'fit',
        width: 150,
        items: [{
            anchor: '100%',
            xtype: 'multiselect',
            width: 148,
            store: [
                ['all', 'All'],
                ['raw', 'Raw Image'],
                ['image_diff', 'Image Diff'],
                ['classified_search', 'Classified Search'],
                ['classified_refine', 'Classified Refined'],
                ['visual_horizon', 'Visual Horizon'],
                ['horizon', 'Horizon'],
                ['objects', 'Field Objects'],
				['lines', 'Debug Lines']
            ],
            blankText: 'No items available',
            listeners: {
                change: 'onLayerSelect'
            }
        }]
    }]
});
