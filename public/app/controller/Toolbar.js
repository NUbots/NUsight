Ext.define('NU.controller.Toolbar', {
    extend: 'Deft.mvc.ViewController',
    requires: 'NU.view.robot.List',
//    config: {
//        renderTo: null
//    },
    control: {
        'add_localisation_display': {
            click: function () {
                Ext.create('NU.view.window.Field', {
                    renderTo: this.getRenderTo()
                });
            }
        },
        'add_vision_display': {
            click: function () {
                Ext.create('NU.view.window.Vision', {
                    renderTo: this.getRenderTo()
                });
            }
        },
        'add_chart_display': {
            click: function () {
                Ext.create('NU.view.window.Chart', {
                    renderTo: this.getRenderTo()
                });
            }
        },
        'add_nuclear_display': {
            click: function () {
                Ext.create('NU.view.window.NUClear', {
                    renderTo: this.getRenderTo()
                });
            }
        },
        'add_classifier_display': {
            click: function() {
                Ext.create('NU.view.window.Classifier', {
                    renderTo: this.getRenderTo()
                });
            }
        },
        'list_robots': {
            click: function () {
                Ext.create('Ext.Window', {
                    autoShow: true,
                    modal: true,
                    title: 'Robot List',
                    width: 400,
                    height: 400,
                    items: [{
                        xtype: 'robotlist'
                    }]
                });
            }
        }
    },
    getRenderTo: function () {
        return Ext.getCmp('main_display').getEl();
    }
});
