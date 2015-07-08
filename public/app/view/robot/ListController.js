Ext.define('NU.view.robot.ListController', {
    extend: 'Ext.app.ViewController',
	alias: 'controller.List',
	init: function () {
		this.grid = this.getView();
	},

	/**
	 * An event triggered when the user presses the button to add a robot.
	 *
	 * @param button The button that was clicked.
	 */
    onAddRobot: function (button) {
	    var grid = this.grid;
		var rowEditing = grid.getPlugin('rowEditing');
		rowEditing.cancelEdit();
		grid.getStore().insert(0, {
			name: '',
			ipAddress: ''
		});
		rowEditing.startEdit(0, 0);
	},

	/**
	 * An event triggered when the user presses the button to remove a robot.
	 *
	 * @param button The button that was clicked.
	 */
    onRemoveRobot: function (button) {
		var grid = this.grid;
		var rowEditing = grid.getPlugin('rowEditing');
		var selectionModel = grid.getSelectionModel();
		rowEditing.cancelEdit();
		var store = grid.getStore();
		store.remove(selectionModel.getSelection());
		if (store.getCount() > 0) {
			selectionModel.select(0);
		}
	},

	/**
	 * An event triggered when the user toggles the checkbox in the grid.
	 *
	 * @param column The checkcolumn that was altered.
	 * @param rowIndex The row within the store that had the checkbox toggled.
	 * @param checked The new state of the checkbox.
	 */
	onCheckChange: function (column, rowIndex, checked) {
		var store = this.grid.getStore();
		var record = store.getAt(rowIndex);
		record.set('enabled', checked);
	}
});
