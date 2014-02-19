Ext.define('NU.view.robot.Selector', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.robot_selector',
    controller: 'NU.controller.robot.Selector',
    inject:  'robotsStore',
    config: {
        robotsStore: null
    },
    itemId: 'robotSelector',
    initComponent: function () {
        Ext.apply(this, {
            fieldLabel: 'Robot',
            labelWidth: 40,
            queryMode: 'local',
            forceSelection: true,
            editable: false,
            displayField: 'name',
            valueField: 'ipAddress',
            emptyText: 'No Robot Selected',
            store: this.getRobotsStore()
        });

        this.callParent(arguments);
    }
});
