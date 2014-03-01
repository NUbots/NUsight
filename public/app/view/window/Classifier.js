Ext.define('NU.view.window.Classifier', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_classifier_window'],
    controller: 'NU.controller.Classifier',
    inject: [
        'classifierTargetStore',
        'classifierSelectionToolStore'
    ],
    config: {
        classifierTargetStore: null,
        classifierSelectionToolStore: null
    },
    title: 'Classifier',
    width: 800,
    height: 600,
    layout: 'hbox',
    initComponent: function () {
        Ext.apply(this, {
            tbar: [{
                xtype: 'robot_selector'
            }, {
                xtype: 'combo',
                itemId: 'selectionToolSelector',
                store: this.getClassifierSelectionToolStore(),
                displayField: 'name',
                valueField: 'id',
                value: 'point'
            }],
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
                        backgroundPosition: 'center',
                        cursor: 'crosshair'
                    }
                }, {
                    itemId: 'rawValue',
                    width: 200
                }, {
                    itemId: 'snapshot',
                    xtype: 'checkbox',
                    fieldLabel: 'Freeze',
                    labelWidth: 70
                }, {
                    itemId: 'overwrite',
                    xtype: 'checkbox',
                    fieldLabel: 'Overwrite',
                    labelWidth: 70,
                    checked: false
                }, {
                    itemId: 'zoom',
                    xtype: 'checkbox',
                    fieldLabel: 'Zoom',
                    labelWidth: 70,
                    checked: true
                }, {
                    itemId: 'toleranceValue',
                    xtype: 'numberfield',
                    fieldLabel: 'Tolerance',
                    value: 5,
                    step: 1
                }, {
                    itemId: 'target',
                    xtype: 'combo',
                    value: 'Field',
                    displayField: 'name',
                    store: this.getClassifierTargetStore(),
                    fieldLabel: 'Target',
                    labelWidth: 70
               }
                ]
            }, {
                items: [{
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
                        cursor: 'crosshair',
                        margin: '10px'
                    }
                }, {
                    itemId: 'classifiedValue',
                    width: 200
                }, {
                    itemId: 'rawOverlay',
                    xtype: 'checkbox',
                    checked: true,
                    fieldLabel: 'Overlay'
                }, {
                    itemId: 'rawOverlayOpacity',
                    xtype: 'numberfield',
                    fieldLabel: 'Overlay Opacity'
                }]
            }]
        });

        return this.callParent(arguments);
    }
});
