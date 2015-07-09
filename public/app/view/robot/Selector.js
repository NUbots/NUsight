Ext.define('NU.view.robot.Selector', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.robot_selector',
    requires: 'NU.view.robot.SelectorController',
    controller: 'RobotSelector',
	fieldLabel: 'Robot',
	labelWidth: 40,
	queryMode: 'local',
	forceSelection: true,
	editable: false,
	displayField: 'name',
	valueField: 'host',
	emptyText: 'No Robot Selected',
	store: 'Robots',
	listeners: {
		select: 'onSelectRobot'
	}
});
