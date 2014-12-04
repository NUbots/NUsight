Ext.define('NU.view.factory.angle.Angle', {
    extend: 'Ext.container.Container',
    requires: [
        'NU.view.factory.angle.AngleController'
    ],
    controller: 'Angle',
    config: {
        dimensions: null
    },
    layout: {
        type: 'hbox',
        align: 'middle'
    },
    items: [{
        xtype: 'container',
        layout: 'fit',
        autoEl: {
            tag: 'svg',
            preserveAspectRatio: 'xMidYMid meet'
        },
        listeners: {
            afterrender: 'onAfterRender'
        },
        flex: 1
    },  {
        xtype: 'numberfield',
        reference: 'input',
        value: 0,
        listeners: {
            blur: 'onInputUpdate'
        },
        style: {
            marginRight: '1em'
        },
        flex: 1
    }]
});
