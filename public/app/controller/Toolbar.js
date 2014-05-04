Ext.define('NU.controller.Toolbar', {
    extend: 'Deft.mvc.ViewController',
    requires: 'NU.view.robot.List',
    control: {
        'add_localisation_display': {
            click: function () {
                Ext.create('NU.view.window.Field', {
                    constrainTo: this.getDisplay()
                });
            }
        },
        'add_vision_display': {
            click: function () {
                Ext.create('NU.view.window.Vision', {
                    constrainTo: this.getDisplay()
                });
            }
        },
        'add_chart_display': {
            click: function () {
                Ext.create('NU.view.window.Chart', {
                    constrainTo: this.getDisplay()
                });
            }
        },
        'add_nuclear_display': {
            click: function () {
                Ext.create('NU.view.window.NUClear', {
                    constrainTo: this.getDisplay()
                });
            }
        },
        'add_classifier_display': {
            click: function () {
                Ext.create('NU.view.window.Classifier', {
                    constrainTo: this.getDisplay()
                });
            }
        },
		'visualise': {
			click: function () {
				// calculations
				var display = this.getDisplay();
				var width = display.getWidth();
				var height = display.getHeight();
				var halfHeight = height / 2;
				var x = display.getX();
				var y = display.getY();
				var magic = 1.3898; // vision window needs to be this ratio of width/height (this is a hack)
				var padding = 5;

				var size = (height - 3 * padding) / 2;

				Ext.create('NU.view.window.Field', {
					constrainTo: display,
					x: x + padding,
					y: y + padding,
					width: width - (size * magic) - 3 * padding,
					height: size
				});
				Ext.create('NU.view.window.Vision', {
					constrainTo: display,
					x: x + width - (size * magic) - padding,
					y: y + padding,
					width: size * magic,
					height: size
				});
				Ext.create('NU.view.window.Chart', {
					constrainTo: display,
					x: x + padding,
					y: y + height - size - padding,
					width: width - (size * magic) - 3 * padding,
					height: size
				});
				Ext.create('NU.view.window.Vision', {
					constrainTo: display,
					x: x + width - (size * magic) - padding,
					y: y + height - size - padding,
					width: size * magic,
					height: size
				});
			}
		},
		'close_all': {
			click: function () {
				Ext.WindowManager.each(function (window) {
					window.close();
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
    getDisplay: function () {
        return Ext.getCmp('main_display').getEl();
    }
});
