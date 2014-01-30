Ext.define('NU.controller.Display', {
    extend: 'Deft.mvc.ViewController',
    config: {
        'robotIP': null
    },
    control: {
        'robot_selector': {
            live: true,
                listeners: {
                robotIP: function (robotIP) {
                    this.setRobotIP(robotIP);
                }
            }
        }
    },
    constructor: function() {
        // needed to merge controls
        Ext.merge(this.control, this.superclass.control);

        return this.callParent(arguments);
    }
});

