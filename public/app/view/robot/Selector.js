Ext.define('NU.view.robot.Selector', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.robot_selector',
    requires: 'NU.controller.robot.Selector',
    controller: 'RobotSelector',
    inject:  'robotsStore',
    config: {
        robotsStore: null
    },
    itemId: 'robotSelector',
	fieldLabel: 'Robot',
	labelWidth: 40,
	queryMode: 'local',
	forceSelection: true,
	editable: false,
	displayField: 'name',
	valueField: 'ipAddress',
	emptyText: 'No Robot Selected',
	store: 'Robots'
});
