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
                var robotIP = records[0].get('ipAddress');
                this.setRobotIP(robotIP);
				setTimeout(function () { // hack to allow live selectors to have attached
					combo.fireEvent('selectRobotIP', robotIP);
				}, 1);
            }
        }
    },
    init: function () {
        // select first value by default
        var combo = this.getView();
        var recordSelected = combo.getStore().getAt(0);
        if (recordSelected) {
            combo.select(recordSelected, true);
            combo.fireEvent('select', combo, [recordSelected]);
        }
    }
});

