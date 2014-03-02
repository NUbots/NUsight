Ext.define('NU.view.window.Classifier', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_classifier_window'],
    controller: 'NU.controller.Classifier',
    title: 'Classifier',
    width: 800,
    height: 600,
    layout: 'hbox',
    initComponent: function () {
        Ext.apply(this, {
            onEsc: Ext.emptyFn,
            tbar: [{
                xtype: 'robot_selector'
            }, '->', {
                text: 'Undo',
                itemId: 'undo'
            }, {
                text: 'Redo',
                itemId: 'redo'
            }, {
                text: 'Reset',
                itemId: 'reset'
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'left',
                items: [{
                    itemId: 'toolPoint',
                    iconCls: 'icon-pencil',
                    toggleGroup: 'tool',
                    tooltip: 'Point Tool - Classify the point clicked on +/- the range (right click to unclassify the point)'
                }, {
                    itemId: 'toolMagicWand',
                    iconCls: 'icon-wand',
                    toggleGroup: 'tool',
                    pressed: true,
                    tooltip: 'Magic Wand Tool - Select the point clicked and similar surrounding pixels using tolerance (right click to classify)'
                }, {
                    itemId: 'toolPolygon',
                    iconCls: 'icon-toolbar-polygon',
                    toggleGroup: 'tool',
                    tooltip: 'Polygon Tool - Draw a polygon with a set of points, double click to apply (right click to remove last point)'
                }, '-', {
                    itemId: 'toolZoom',
                    iconCls: 'icon-toolbar-zoom',
                    enableToggle: true,
                    pressed: true,
                    tooltip: 'Enables a zoom overlay'
                }, {
                    itemId: 'toolOverwrite',
                    iconCls: 'icon-page-white-paint',
                    enableToggle: true,
                    tooltip: 'Enables the overwriting of already classified colours (needed for unclassifying)'
                }, '-', {
                    itemId: 'targetGreen',
                    iconCls: 'icon-toolbar-green',
                    toggleGroup: 'target',
                    tooltip: 'Field',
                    pressed: true
                }, {
                    itemId: 'targetOrange',
                    iconCls: 'icon-toolbar-orange',
                    toggleGroup: 'target',
                    tooltip: 'Ball'
                }, {
                    itemId: 'targetYellow',
                    iconCls: 'icon-toolbar-yellow',
                    toggleGroup: 'target',
                    tooltip: 'Goal'
                }, {
                    itemId: 'targetWhite',
                    iconCls: 'icon-toolbar-white',
                    toggleGroup: 'target',
                    tooltip: 'Line'
                }, {
                    itemId: 'targetBlack',
                    iconCls: 'icon-toolbar-black',
                    toggleGroup: 'target',
                    tooltip: 'Unclassified'
                }]
            }],
            items: [{
                style: {
                    marginRight: '10px'
                },
                items: [{
                    style: {
                        border: '5px solid #000'
                    },
                    items: {
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
                            cursor: 'crosshair',
                            display: 'block'
                        }
                    }
                }, {
                    itemId: 'rawValue',
                    width: 320,
                    html: '(X, Y) = rgb(R, G, B)',
                    style: {
                        margin: '5px',
                        textAlign: 'center'
                    }
                }, {
                    itemId: 'snapshot',
                    xtype: 'checkbox',
                    fieldLabel: 'Freeze',
                    labelWidth: 70
                }, {
                    itemId: 'toleranceValue',
                    xtype: 'numberfield',
                    fieldLabel: 'Tolerance',
                    value: 5,
                    step: 1
                }]
            }, {
                items: [{
                    style: {
                        border: '5px solid #000'
                    },
                    items: {
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
                            display: 'block'
                        }
                    }
                }, {
                    itemId: 'classifiedValue',
                    width: 320,
                    html: '(X, Y) = rgb(R, G, B)',
                    style: {
                        margin: '5px',
                        textAlign: 'center'
                    }
                }, {
                    itemId: 'rawUnderlay',
                    xtype: 'checkbox',
                    checked: true,
                    fieldLabel: 'Underlay'
                }, {
                    itemId: 'rawUnderlayOpacity',
                    xtype: 'numberfield',
                    fieldLabel: 'Underlay Opacity',
                    step: 0.1,
                    value: 0.5,
                    minValue: 0,
                    maxValue: 1
                }]
            }]
        });

        return this.callParent(arguments);
    }
});
