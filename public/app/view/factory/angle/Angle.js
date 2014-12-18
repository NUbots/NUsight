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
        pack: 'center',
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
        style: {
            marginLeft: '1em'
        }
    },  {
        xtype: 'numberfield',
        reference: 'input',
        value: 0,
        listeners: {
            change: 'onInputUpdate'
        },
        style: {
            marginLeft: '1em',
            marginRight: '1em'
        },
        flex: 0.5
    }]
});
