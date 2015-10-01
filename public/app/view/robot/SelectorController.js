Ext.define('NU.view.robot.SelectorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.RobotSelector',
    config: {
        robotId: null
    },
    init: function () {
        // select first value by default
        var combo = this.getView();
        var recordSelected = combo.getStore().getAt(0);
        if (recordSelected) {
            combo.select(recordSelected);
            combo.fireEvent('select', combo, [recordSelected]);
        }
    },

    onSelectRobot: function (combo, records) {
		var robotId = records[0].get('id');
		this.setRobotId(robotId);
        combo.fireEvent('selectRobot', robotId);
	}
});

