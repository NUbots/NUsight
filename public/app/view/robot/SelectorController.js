Ext.define('NU.view.robot.SelectorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.RobotSelector',
    config: {
        robotIP: null
    },
    init: function () {
        // select first value by default
        var combo = this.getView();
        var recordSelected = combo.getStore().getAt(0);
        if (recordSelected !== undefined) {
            combo.select(recordSelected);
            combo.fireEvent('select', combo, recordSelected);
        }
    },
    onSelectRobot: function (combo, records) {
        // get the first robot ip
		var robotIP = records.get('ipAddress');
        // set the robot ip
		this.setRobotIP(robotIP);
        // fire an event
        combo.fireEvent('selectRobot', robotIP);
	}
});

