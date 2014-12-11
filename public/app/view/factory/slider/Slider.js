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
        var minValue = this.getMinValue() || Math.floor(value - value * 0.5);
        var maxValue = this.getMaxValue() || Math.ceil(value + value * 0.5);
        var increment = this.getIncrement() || 0;
        Ext.apply(this, {
            items: [{
                xtype: 'slider',
                reference: 'slider',
                decimalPrecision: false,
                width: this.getSliderWidth() || 300,
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
