Ext.define('NU.view.window.Classifier', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_classifier_window'],
    controller: 'NU.controller.Classifier',
    title: 'Classifier',
    width: 800,
    height: 400,
    layout: 'hbox',
    items: [{
        items: [{
            itemId: 'rawImage',
            width: 320,
            height: 240,
            autoEl: {
                tag: 'canvas',
                width: 320,
                height: 240
            },
            style: {
                backgroundColor: '#000',
                backgroundImage: "url('resources/images/camera.png')",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            }
        }, {
            itemId: 'snapshot',
            xtype: 'checkbox',
            text: 'snapshot',
            fieldLabel: 'Freeze',
            labelWidth: 50
        }]
    }, {
        itemId: 'classifiedImage',
        width: 320,
        height: 240,
        autoEl: {
            tag: 'canvas',
            width: 320,
            height: 240
        },
        style: {
            backgroundColor: '#000',
            backgroundImage: "url('resources/images/camera.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
        }
    }]
});
