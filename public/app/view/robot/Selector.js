Ext.define('NU.view.robot.Selector', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.robot_selector',
    requires: 'NU.controller.robot.Selector',
    controller: 'RobotSelector',
	fieldLabel: 'Robot',
	labelWidth: 40,
	queryMode: 'local',
	forceSelection: true,
	editable: false,
	displayField: 'name',
	valueField: 'ipAddress',
	emptyText: 'No Robot Selected',
	store: 'Robots',
	listeners: {
		select: 'onSelectRobot'
	}
});
