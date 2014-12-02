Ext.define('NU.view.factory.WidgetController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Widget',
    widget: null,
    WIDGET: {
        TEXTBOX:    {value: 0, name: "Textbox",  type: "TEXT"},
        NUMBER:     {value: 1, name: "Number",   type: "NUMBER"},
        CHECKBOX:   {value: 2, name: "Checkbox", type: "BOOLEAN"},
        COMBOBOX:   {value: 3, name: "Combobox", type: "SELECT"},
        SLIDER:     {value: 4, name: "Slider",   type: "SLIDER"}
    },
    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.Checkbox',
        'Ext.form.field.ComboBox',
        'Ext.slider.Single'
    ],
    init: function () {
        this.widget = this.getView();
    },
    onWidgetAttach: function (record) {
        var name = record.get('name');
        var value = record.get('value');
        var type = record.get('type');
        function resolve (widget) {
            return widget.type;
        }
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
                this.addSlider(name, value); // todo
                break;
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
            reference: this.transformReference(configuration),
            value: value
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
            reference: this.transformReference(configuration),
            value: value,
            minValue: minValue || 0,
            maxValue: maxValue || 100
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
            reference: this.transformReference(configuration),
            checked: checked
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
        var store = Ext.create('Ext.data.Store', {              // create the store
            fields: [key],                                      // the name of the field
            data: data                                          // the data array
        });
        this.widget.add(Ext.create('Ext.form.field.ComboBox', {
            reference: this.transformReference(configuration),
            store: store,
            queryMode: 'local',
            displayField: 'key',
            valueField: 'key'
        }));
    },
    /**
     * Adds a slider to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param [value] The value currently associated with the slider configuration.
     * @param [minValue] The minimum value allowed for this configuration.
     * @param [maxValue] The maximum value allowed for this configuration.
     * @param [width] The width of the slider.
     * @param [increment] The amount to increment the slider by.
     */
    addSlider: function (configuration, value, minValue, maxValue, width, increment) {
        // initialise the default values if there are no parameters passed to the function
        minValue = minValue || 0;
        maxValue = maxValue || 1;
        increment = increment || 1;
        // create a container for both the slider and text input
        var container = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });
        // create the slider control
        var slider = Ext.create('Ext.slider.Single', {
            reference: this.transformReference(configuration),
            width: width || 300,
            value: value,
            minValue: minValue,
            maxValue: maxValue,
            increment: increment,
            style: {
                marginRight: '1em'
            }
        });
        // create the text input control
        var input = Ext.create('Ext.form.field.Text', {
            value: value,
            minValue: minValue,
            maxValue: maxValue,
            enableKeyEvents: true
        });
        // add a change listener to the slider so it updates the input control
        slider.addListener('change', function (slider, value) {
            input.setValue(value);
        });
        // add a change listener to the input control so it updates the slider
        input.addListener('change', function (text, value) {
            if (value % increment === 0) {
                slider.setValue(value);
            }
        });
        container.add([slider, input]);     // add the slider and input to the container
        this.widget.add(container);         // add the container to the widget
    },
    /**
     * Transforms the reference to ensure it is valid by replacing any spaces with underscores.
     *
     * @param configuration The name of the configuration to transform so it is valid.
     * @returns {*} The new reference name of the configuration.
     */
    transformReference: function (configuration) {
        return configuration.replace(/ /g, '_');
    }
});
