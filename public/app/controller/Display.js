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
                selectRobotIP: function (robotIP) {
                    this.setRobotIP(robotIP);
                    this.fireEvent('selectRobotIP', robotIP);
                }
            }
        },
        'view': {
            boxready: 'onResize',
            resize: 'onResize'
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
        if (this.getRobotSelector() !== null) {
            var robotIP = this.getRobotSelector().getController().getRobotIP();
            this.setRobotIP(robotIP);
            this.fireEvent('selectRobotIP', robotIP);
        }

        return this.callParent(arguments);
    },
    onResize: function (view, width, height) {
        // hack because ExtJS seems not to do this correctly! >_<
        if (view.maximized) {
            var newBox = view.constrainTo.getViewSize(false);
            newBox.x = 0;
            newBox.y = 0;
            view.setBox(newBox)
        }
    }
});
