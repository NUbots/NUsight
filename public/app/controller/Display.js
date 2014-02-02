Ext.define('NU.controller.Display', {
    extend: 'Deft.mvc.ViewController',
    requires: 'NU.util.Network',
    mixins: {
        observable: 'Ext.util.Observable'
    },
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

        this.mixins.observable.constructor.call(this);
        this.addEvents('robot_ip');

        this.callParent(arguments);

    },
    init: function () {

        Ext.each(NU.util.Network.getRobotIPs(), function (robotIP) {

            this.addRobotIP(robotIP);

        }, this);

        NU.util.Network.on('robot_ip', function (robotIP) {

            this.addRobotIP(robotIP);

        }, this);

        return this.callParent(arguments);

    },
    addRobotIP: function (robotIP) {

        this.fireEvent('robot_ip', robotIP);

    }
});
