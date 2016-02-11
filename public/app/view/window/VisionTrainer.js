Ext.define('NU.view.window.VisionTrainer', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_chart_window',
    requires: [
        'NU.view.window.VisionTrainerController',
        'Ext.ux.form.MultiSelect',
        'Ext.layout.container.Anchor',
        'NU.store.Streams',
        'NU.view.camera.Selector',
        'NU.view.LayeredCanvas'
    ],
    controller: 'VisionTrainer',
    title: 'Vision Trainer',
    width: 720,
    height: 295,
//    resizable: {
//        preserveRatio: true
//    },
    layout: 'border',
    listeners: {
        afterrender: 'onAfterRender'
    },
    tbar: {
        xtype: 'toolbar',
        layout: {
            overflowHandler: 'Menu'
        },
        items: [{
            xtype: 'robot_selector',
            listeners: {
                selectRobot: 'onSelectRobot'
            }
        }, {
            xtype: 'camera_selector',
            listeners: {
                selectCamera: 'onSelectCamera'
            }
        }, {
            text: 'Screenshot Positive',
            listeners: {
                click: 'screenshot'
            }
        }]
    },
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
    }]
});

