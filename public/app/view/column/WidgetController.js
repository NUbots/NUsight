/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.column.WidgetController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.WidgetColumn',
    widgets: null,
    init: function () {
        this.widgets = {};
    },
    /**
     * An event triggered when either the widget column or window is resized. It iterates through all the known widgets
     * and sets their new width.
     *
     * @param column The widget column view.
     * @param width The width to set the widgets to.
     */
    onResize: function (column, width) {
        column.setWidth(width);
        Ext.Object.each(this.widgets, function (key, widget) {
            widget.setWidth(width);
        });
    },
    /**
     * An event triggered before the widget column is rendered. It sets up the listeners on the tree view.
     *
     * @param column The widget column.
     */
    onBeforeRender: function (column) {
        // get the treeview from the column
        var view = column.getView();
        // add the listeners to the treeview
        view.on({
            refresh: this.onViewRefresh,
            itemadd: this.onItemAdd,
            scope: this
        });
    },
    /**
     * An event triggered when record items are added to the treeview. It is usually called as an optimisation after
     * items that are not in view have been removed and are visible again.
     *
     * @param records The records being added to the view.
     */
    onItemAdd: function (records) {
        var view = this.getView();                      // get the column view
        var treeView = view.getView();                  // get the tree view from the column view
        this.updateRecords(view, treeView, records);    // update the records
    },
    /**
     * An event triggered when the view is refreshed. This occurs when the window is initialised and when any item is
     * expanded or collapsed.
     *
     * @param treeView The tree view.
     * @param records The records associated with the store.
     */
    onViewRefresh: function (treeView, records) {
        this.updateRecords(this.getView(), treeView, records);
    },
    /**
     * This method is called when the widgets associated with a record need to be updated.
     *
     * @param column The widget column view.
     * @param treeView The tree view.
     * @param records The records being updated.
     */
    updateRecords: function (column, treeView, records) {
        Ext.suspendLayouts();
        // iterate through every record
        Ext.each(records, function (record) {
            // get the cell given the current record at the appropriate column
            var cell = treeView.getRow(record).cells[column.getVisibleIndex()];
            // update the cell given its record and cell
            this.updateCell(column, treeView, record, cell);
        }, this);
        Ext.resumeLayouts(true);
    },
    /**
     * Updates the cell display by displaying the widget with its respective record data.
     *
     * @param column The widget column view.
     * @param treeView The tree view.
     * @param record The record that corresponds to the cell view.
     * @param cell The cell that contains the widget.
     */
    updateCell: function (column, treeView, record, cell) {
        var widget = this.widgets[record.internalId];       // get the widget from the map
        Ext.fly(cell).empty();                              // remove the current contents of the cell
        if (widget === undefined) {                         // check if the widget has been created
            this.createWidget(column, record, cell);        // create the widget
        } else {
            var dom = widget.getEl().dom;                   // get the dom from the element
            if (dom !== null) {                             // check the dom exists
                cell.appendChild(dom);                      // append the existing dom to the cell
            } else {
                this.createWidget(column, record, cell);    // recreate the widget since it has been destroyed
            }
        }
    },
    /**
     * Creates a widget in its corresponding cell based on the record data.
     *
     * @param column The widget column view.
     * @param record The record that corresponds to the cell view.
     * @param cell The cell that contains the widget.
     */
    createWidget: function (column, record, cell) {
        var widget = Ext.widget(column.getWidget().xtype, {
            record: record,
            listeners: {
                afterRender: function (widget) {        // wait for the widget to finish rendering
                    widget.getEl().on({                 // add a click event listener to the widget
                        click: this.onClick
                    });
                },
                update: function (record, value) {
                    this.fireViewEvent('updateWidget', record, value);
                },
                scope: this
            }
        });
        this.widgets[record.internalId] = widget;       // add the widget to the map
        widget.render(cell);                            // render the widget to the cell
    },
    /**
     * An event triggered when a widget is clicked on. The event is stopped to prevent the grid base structure from
     * taking focus.
     *
     * @param event The click event object.
     */
    onClick: function (event) {
        event.stopEvent();
    }
});
