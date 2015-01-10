/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.factory.WidgetController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Widget',
    widget: null,
    WIDGET: {
        TEXTBOX:    {type: "TEXT"},
        NUMBER:     {type: "NUMBER"},
        CHECKBOX:   {type: "BOOLEAN"},
        COMBOBOX:   {type: "SELECT"},
        SLIDER:     {type: "SLIDER"},
        ANGLE:      {type: "ANGLE"}
    },
    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.Checkbox',
        'Ext.form.field.ComboBox',
        'NU.view.factory.slider.Slider',
        'NU.view.factory.angle.Angle'
    ],
    init: function () {
        var view = this.getView();
        this.widget = view;
        this.render(view.getRecord());
    },
    /**
     * Renders the widget based on the record data.
     *
     * @param record The record associated with the widget.
     */
    render: function (record) {
        // get the name from the record and ensure it is a valid identifier
        var name = this.transformName(record.get('name'));
        // get the value of the widget from the record
        var value = record.get('value');
        var type = record.get('type');      // get the type of widget from the record
        function resolve (widget) {         // a private function that resolves the enumeration so it can be evaluated
            return widget.type;
        }
        // evaluates the widget based on its type
        switch (type) {
            case resolve(this.WIDGET.TEXTBOX):
                this.addTextField(name, value);
                break;
            case resolve(this.WIDGET.NUMBER):
                this.addNumberField(name, value);
                break;
            case resolve(this.WIDGET.CHECKBOX):
                this.addCheckbox(name, value);
                break;
            case resolve(this.WIDGET.COMBOBOX):
                this.addComboBox(name, value); // todo
                break;
            case resolve(this.WIDGET.SLIDER):
                this.addSlider(name, value);
                break;
            case resolve(this.WIDGET.ANGLE):
                this.addAngle(name, value);
                break;
        }
    },
    /**
     * A method that gets called when a widget is updated to update the respective configuration that is associated
     * with the widget and its record.
     *
     * @param widget The widget being updated.
     * @param value The new value of the widget.
     */
    update: function (widget, value) {
        if (widget.isValid()) {                             // check if the widget is valid before updating it
            var record = this.getView().getRecord();        // get the record from the view
            this.fireViewEvent('update', record, value);    // fire an event that updates the configuration file
        }
    },
    /**
     * Adds a text field to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param [value] The value currently associated with the text field configuration.
     */
    addTextField: function (configuration, value) {
        this.widget.add(Ext.create('Ext.form.field.Text', {
            reference: configuration,
            value: value,
            listeners: {
                change: function (widget, value) {
                    this.update(widget, value);
                },
                scope: this
            }
        }));
    },
    /**
     * Adds a number field to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param [value] The value currently associated with the number field configuration.
     * @param [minValue] The minimum value allowed for this configuration.
     * @param [maxValue] The maximum value allowed for this configuration.
     */
    addNumberField: function (configuration, value, minValue, maxValue) {
        this.widget.add(Ext.create('Ext.form.field.Number', {
            reference: configuration,
            value: value,
            minValue: minValue || 0,
            maxValue: maxValue || 100,
            listeners: {
                change: function (widget, value) {
                    this.update(widget, value);
                },
                scope: this
            }
        }));
    },
    /**
     * Adds a check box to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param [checked] Whether the checkbox is checked or not.
     */
    addCheckbox: function (configuration, checked) {
        this.widget.add(Ext.create('Ext.form.field.Checkbox', {
            reference: configuration,
            checked: checked,
            listeners: {
                change: function (widget, value) {
                    this.update(widget, value);
                },
                scope: this
            }
        }));
    },
    /**
     * Adds a combo box to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param key The key used for each value.
     * @param values The values associated with the configuration.
     */
    addComboBox: function (configuration, key, values) {
        var data = [];                                          // initialise an array
        for (var i = 0; i < values.length; i++) {               // loop through all the values
            data.push({                                         // add the object with key-value association to the data
                key: values[i]
            });
        }
        this.widget.add(Ext.create('Ext.form.field.ComboBox', {
            reference: configuration,
            store: Ext.create('Ext.data.Store', {              // create the store
                fields: [key],                                 // the name of the field
                data: data                                     // the data array
            }),
            queryMode: 'local',
            displayField: 'key',
            valueField: 'key'
        }));
    },
    /**
     * Adds a slider to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param slider The values currently associated with the slider configuration.
     */
    addSlider: function (configuration, slider) {
        this.widget.add(Ext.create('NU.view.factory.slider.Slider', {
            reference: configuration,
            sliderWidth: slider.width,
            value: slider.value,
            minValue: slider.minValue,
            maxValue: slider.maxValue,
            increment: slider.increment,
            listeners: {
                update: this.update, // TODO
                scope: this
            }
        }));
    },
    /**
     * Adds an angle to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param value The value currently associated with the angle configuration.
     */
    addAngle: function (configuration, value) {
        var size = 100;
        this.widget.add(Ext.create('NU.view.factory.angle.Angle', {
            reference: configuration,
            value: value,
            dimensions: {
                width: size,
                height: size
            },
            listeners: {
                update: this.update, // TODO
                scope: this
            }
        }));
    },
    /**
     * Transforms the name to ensure it is valid by replacing any spaces with underscores.
     *
     * @param configuration The name of the configuration to transform so it is valid.
     * @returns {*} The new name of the configuration.
     */
    transformName: function (configuration) {
        return configuration === undefined ? Ext.id() : configuration.replace(/[./\- ]/g, '_');
    }
});
