Ext.define('NU.view.robot.ListController', {
    extend: 'Ext.app.ViewController',
	alias: 'controller.List',
    onAddRobot: function (combo, records, eOpts) {
		var grid = this.getView();
		var rowEditing = grid.getPlugin('rowEditing');
		rowEditing.cancelEdit();
		grid.getStore().insert(0, {
			name: '',
			ipAddress: ''
		});
		rowEditing.startEdit(0, 0);
	},
    onRemoveRobot: function (combo, records, eOpts) {
		var grid = this.getView();
		var rowEditing = grid.getPlugin('rowEditing');
		var sm = grid.getSelectionModel();
		rowEditing.cancelEdit();
		var store = grid.getStore();
		store.remove(sm.getSelection());
		if (store.getCount() > 0) {
			sm.select(0);
		}
	}
});
