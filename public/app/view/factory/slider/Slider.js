/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.factory.slider.Slider', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.slider.Single',
        'Ext.form.field.Text',
        'NU.view.factory.slider.SliderController'
    ],
    controller: 'Slider',
    config: {
        sliderWidth: null,
        value: null,
        minValue: null,
        maxValue: null,
        increment: null
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function () {
        // initialise the default values
        var value = this.getValue();
        var minValue = this.getMinValue() === undefined ? Math.floor(value - value * 0.5) : this.getMinValue();
        var maxValue = this.getMaxValue() === undefined ? Math.ceil(value + value * 0.5) : this.getMaxValue();
        var increment = this.getIncrement() === undefined ? 0 : this.getIncrement();
        Ext.apply(this, {
            items: [{
                xtype: 'slider',
                reference: 'slider',
                decimalPrecision: increment === undefined ? false : increment < 1 ? false : 0,
                width: this.getSliderWidth() === undefined ? 300 : this.getSliderWidth(),
                value: value,
                minValue: minValue,
                maxValue: maxValue,
                increment: increment,
                listeners: {
                    change: 'onSliderChange'
                }
            },  {
                xtype: 'textfield',
                reference: 'input',
                enableKeyEvents: true,
                value: value,
                minValue: minValue,
                maxValue: maxValue,
                listeners: {
                    change: 'onInputChange'
                }
            }]
        });
        return this.callParent(arguments);
    }
});
