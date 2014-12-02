Ext.define('NU.view.factory.WidgetController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Widget',
    widget: null,
    attached: false,
    WIDGET: {
        TEXTBOX:    {value: 0, name: "Textbox",  type: "TEXT"},
        NUMBER:     {value: 1, name: "Number",   type: "NUMBER"},
        CHECKBOX:   {value: 2, name: "Checkbox", type: "BOOLEAN"},
        COMBOBOX:   {value: 3, name: "Combobox", type: "SELECT"},
        SLIDER:     {value: 4, name: "Slider",   type: "SLIDER"},
        ANGLE:      {value: 5, name: "Angle",    type: "ANGLE"}
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
        this.widget = this.getView();
    },
    onWidgetAttach: function (record) {
        if (!this.attached) {
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
                case resolve(this.WIDGET.ANGLE):
                    this.addAngle(name, value);
                    break;
            }
            this.attached = true;
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
     * @param value The value currently associated with the slider configuration.
     * @param [minValue] The minimum value allowed for this configuration.
     * @param [maxValue] The maximum value allowed for this configuration.
     * @param [width] The width of the slider.
     * @param [increment] The amount to increment the slider by.
     */
    addSlider: function (configuration, value, minValue, maxValue, width, increment) {
        this.widget.add(Ext.create('NU.view.factory.slider.Slider', {
            reference: this.transformReference(configuration),
            sliderWidth: width,
            value: value,
            minValue: minValue,
            maxValue: maxValue,
            increment: increment
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
            reference: this.transformReference(configuration),
            dimensions: {
                width: size,
                height: size
            }
        }));
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
