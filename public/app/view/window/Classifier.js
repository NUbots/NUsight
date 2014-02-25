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
    height: 400,
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
                    itemId: 'snapshot',
                    xtype: 'checkbox',
                    fieldLabel: 'Freeze',
                    labelWidth: 50
                }, {
                    itemId: 'overwrite',
                    xtype: 'checkbox',
                    fieldLabel: 'Overwrite',
                    labelWidth: 50,
                    checked: false
                }, {
                    itemId: 'target',
                    xtype: 'combo',
                    value: 'Field',
                    displayField: 'name',
                    store: this.getClassifierTargetStore(),
                    fieldLabel: 'target',
                    labelWidth: 50
               }
                ]
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
                        cursor: 'crosshair'
                    }
                }
            ]
        });

        return this.callParent(arguments);
    }
});
