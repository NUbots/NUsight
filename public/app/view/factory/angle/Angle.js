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
    listeners: {
        afterrender: 'onAfterRender'
    },
    items: [{
        xtype: 'container',
        reference: 'svg',
        layout: 'fit',
        autoEl: {
            tag: 'svg',
            preserveAspectRatio: 'xMidYMid meet'
        },
        style: {
            marginLeft: '1em'
        }
    },  {
        xtype: 'numberfield',
        reference: 'input',
        listeners: {
            change: 'onInputUpdate'
        },
        style: {
            marginLeft: '1em',
            marginRight: '1em'
        },
        flex: 1
    }]
});
