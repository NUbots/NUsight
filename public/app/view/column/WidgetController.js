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
     * @param width The width to set the widgets to.
     */
    onResize: function (width) {
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
        var view = column.getView();        // get the treeview from the column
        view.on({                           // add the listeners to the treeview
            refresh: this.onViewRefresh,
            scope: this
        });
    },
    /**
     * An even triggered when the view is refreshed. This occurs when the window is initialised and when any item is
     * expanded or collapsed.
     *
     * @param treeView The tree view.
     * @param records The records associated with the store.
     */
    onViewRefresh: function (treeView, records) {
        var view = this.getView();
        // iterate through every record
        Ext.each(records, function (record) {
            // get the widget from the map
            var widget = this.widgets[record.internalId];
            // get the cell given the current record at the appropriate column
            var cell = treeView.getRow(record).cells[view.getVisibleIndex()];
            // remove the current contents of the cell
            Ext.fly(cell).empty();
            // create the widget if it hasn't been created previously
            if (widget === undefined) {
                var component = Ext.widget(view.getWidget().xtype, {    // create the widget
                    record: record
                });
                this.widgets[record.internalId] = component;            // add the component to the map
                component.render(cell);                                 // render the component to the cell
            } else {
                var dom = widget.getEl().dom;                           // get the dom from the widget
                if (dom !== null) {                                     // check the dom exists
                    cell.appendChild(widget.getEl().dom);               // append the existing dom to the cell
                }
            }
        }, this);
    }
});
