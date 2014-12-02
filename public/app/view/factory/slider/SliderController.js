Ext.define('NU.view.factory.slider.SliderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.Slider',
    slider: null,
    input: null,
    init: function () {
        var view = this.getView();
        this.slider = view.lookupReference('slider');
        this.input = view.lookupReference('input');
    },
    /**
     * An event that is called when the slider is adjusted. It updates the input value to match the new slider input.
     *
     * @param slider The slider component.
     * @param value The new slider value.
     */
    onSliderChange: function (slider, value) {
        this.input.setValue(value);
    },
    /**
     * An event that is called when the user inputs values for the associated slider. It updates the slider value
     * to match the new text input.
     *
     * @param text The text component.
     * @param value The new text value.
     */
    onInputChange: function (text, value) {
        this.slider.setValue(value);
    }
});
