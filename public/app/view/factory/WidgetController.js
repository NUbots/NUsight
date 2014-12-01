Ext.define('NU.view.factory.WidgetController', {
    extend: 'Ext.app.ViewController',
    init: function () {

    },
    /**
     * Adds a text field to the configuration for the robot.
     *
     * @param configuration The configuration name.
     * @param [value] The value currently associated with the text field configuration.
     */
    addTextField: function (configuration, value) {
        this.configurations.add(Ext.create('Ext.form.field.Text', {
            reference: this.transformReference(configuration),
            fieldLabel: this.transformFieldLabel(configuration),
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
        this.configurations.add(Ext.create('Ext.form.field.Number', {
            reference: this.transformReference(configuration),
            fieldLabel: this.transformFieldLabel(configuration),
            value: value,
            minValue: minValue || 0,
            maxValue: maxValue || 100
        }));
    },
    /**
     * Adds a check box to the configuration for the robot.
     *
     * @param configuration The configuration name.
     */
    addCheckbox: function (configuration) {
        this.configurations.add(Ext.create('Ext.form.field.Checkbox', {
            reference: this.transformReference(configuration),
            fieldLabel: this.transformFieldLabel(configuration)
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
        this.configurations.add(Ext.create('Ext.form.field.ComboBox', {
            reference: this.transformReference(configuration),
            fieldLabel: this.transformFieldLabel(configuration),
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
        var label = Ext.create('Ext.Component', {
            html: this.transformFieldLabel(configuration)
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
        container.add([label, slider, input]);         // add the slider and input to the container
        this.configurations.add(container);     // add the container to the configurations
    },
    /**
     * Transforms the reference to ensure it is valid by replacing any spaces with underscores.
     *
     * @param configuration The name of the configuration to transform so it is valid.
     * @returns {*} The new reference name of the configuration.
     */
    transformReference: function (configuration) {
        return configuration.replace(/ /g, '_');
    },
    /**
     * Transforms the configuration to a standardised field label. It removes the underscores in the string and
     * capitalises each word.
     *
     * @param configuration The name of the configuration to transform into a field label.
     * @returns {*} The field label associated with the configuration.
     */
    transformFieldLabel: function (configuration) {
        return configuration; // todo: remove underscores and upper case letters
    }
});
