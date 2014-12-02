Ext.define('NU.view.factory.angle.Angle', {
    extend: 'Ext.container.Container',
    requires: [
        'NU.view.factory.angle.AngleController'
    ],
    controller: 'Angle',
    config: {
        dimensions: null
    },
    layout: 'fit',
    autoEl: {
        tag: 'svg',
        preserveAspectRatio: 'xMidYMid meet'
    },
    listeners: {
        afterrender: 'onAfterRender'
    }
});
