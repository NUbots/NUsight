/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.factory.WidgetController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Widget',
    widget: null,
    attached: false,
    WIDGET: {
        BLANK:      {type: "BLANK"},
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
                case resolve(this.WIDGET.BLANK):
                    this.widget.add(Ext.create('Ext.container.Container'));
                    break;
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
            reference: configuration,
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
            reference: configuration,
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
            reference: configuration,
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
            reference: configuration,
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
            reference: configuration,
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
            reference: configuration,
            dimensions: {
                width: size,
                height: size
            }
        }));
    }
});
