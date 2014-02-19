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
        'robotSelector': {
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

        this.callParent(arguments);

    },
    init: function () {
        // TODO: a bit too tightly coupled
        this.setRobotIP(this.getRobotSelector().getController().getRobotIP());
    }
});
