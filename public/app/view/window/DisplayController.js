Ext.define('NU.view.window.DisplayController', {
    extend: 'Ext.app.ViewController',
	config: {
		robotIP: null
	},
	init: function () {
		//this.robots = {};
	},

	onSelectRobot: function (robotIP) {
		this.setRobotIP(robotIP);
	},

    onMaximize: function (view) {
        // hack because ExtJS seems not to do this correctly! >_<
		var newBox = view.constrainTo.getViewSize(false);
		newBox.x = 0;
		newBox.y = 0;
		view.setBox(newBox)
    }
});
