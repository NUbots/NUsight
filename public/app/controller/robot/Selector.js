Ext.define('NU.controller.robot.Selector', {
    extend: 'Deft.mvc.ViewController',
    requires: 'NU.util.Network',
    inject:  'robotsStore',
    config: {
        robotIP: null,
        robotsStore: null
    },
    control: {
        'view': {
            select: function (combo, records, eOpts) {
                var robotIP = records[0].data.ipAddress;
                this.setRobotIP(robotIP);
                combo.fireEvent('robotIP', robotIP);
            }
        }
    },
    init: function () {
        // select first value by default
        var combo = this.getView();
        var recordSelected = combo.getStore().getAt(0);
        combo.select(recordSelected, true);
        combo.fireEvent('select', combo, [recordSelected]);
    }
});

