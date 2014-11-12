Ext.define('NU.controller.Display', {
    extend: 'Ext.app.ViewController',
	config: {
		robotIP: null
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
