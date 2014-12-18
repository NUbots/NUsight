/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.factory.angle.Angle', {
    extend: 'Ext.container.Container',
    requires: [
        'NU.view.factory.angle.AngleController'
    ],
    controller: 'Angle',
    config: {
        value: null,
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
            preserveAspectRatio: 'xMaxYMid meet'
        },
        listeners: {
            afterrender: 'onAfterRender'
        },
        style: {
            marginRight: '1em'
        },
        flex: 0.5
    },  {
        xtype: 'numberfield',
        reference: 'input',
        value: 0,
        listeners: {
            change: 'onInputUpdate'
        },
        flex: 1
    }]
});
