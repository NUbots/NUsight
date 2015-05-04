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
        min: null,
        max: null,
        step: null
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function () {
        // Initialise the default values
        var value = this.getValue();
        var min = this.getMin() === undefined ? Math.floor(value - value * 0.5) : this.getMin();
        var max = this.getMax() === undefined ? Math.ceil(value + value * 0.5) : this.getMax();
        var step = this.getStep() === undefined ? 1 : this.getStep();
        // Horrible way to get the max value.
        var maxValue = (function () {
            var count = 0;
            for (var i = min; i <= max; i += step, count++) {}
            return count;
        }());
        Ext.apply(this, {
            items: [{
                xtype: 'slider',
                reference: 'slider',
                width: this.getSliderWidth() === undefined ? 300 : this.getSliderWidth(),
                value: (value / step) - min + 1,
                minValue: 1,
                maxValue: maxValue,
                increment: 1,
                useTips: false,
                listeners: {
                    change: 'onSliderChange'
                }
            },  {
                xtype: 'textfield',
                reference: 'input',
                enableKeyEvents: true,
                value: value,
                minValue: min,
                maxValue: max,
                listeners: {
                    change: 'onInputChange'
                }
            }]
        });
        return this.callParent(arguments);
    }
});
