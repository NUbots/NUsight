/**
 * @author: Monica Olejniczak
 */
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
     * An event that is called when the slider is adjusted. It updates the input value to match the new slider input
     * and applies a conversion to deal with the issues with the native component.
     *
     * @param slider The slider component.
     * @param value The new slider value.
     */
    onSliderChange: function (slider, value) {
        // Convert the value to the correct slider value.
        value = this.getSliderValue(value);
        // Suspend the events before modifying the input value so it does not trigger a change event.
        this.input.suspendEvents();
        // Set the value of the input.
        this.input.setValue(value);
        // Resume the events on the input.
        this.input.resumeEvents();
        this.fireViewEvent('update', this.slider, value);
    },
    /**
     * An event that is called when the user inputs values for the associated slider. It updates the slider value
     * to match the new text input and applies a conversion to deal with the issues with the native component.
     *
     * @param text The text component.
     * @param value The new text value.
     */
    onInputChange: function (text, value) {
        // Parse the string value to a float.
        value = parseFloat(value);
        // Suspend the events before modifying the slider value so it does not trigger a change event.
        this.slider.suspendEvents();
        // Set the value of the slider by converting the value.
        this.slider.setValue(this.getInputValue(value));
        // Resume the events on the slider.
        this.slider.resumeEvents();
        // Fire the event to update.
        this.fireViewEvent('update', this.slider, value);
    },
    /**
     * Applies a conversion for the slider when its value changes so it can be used for the input.
     *
     * @param value The value being converted.
     * @returns {*} The converted value.
     */
    getSliderValue: function (value) {
        var view = this.getView();
        return view.getMin() + (view.getStep() * (value - 1));
    },
    /**
     * Applies a conversion for the input when its value changes so the slider value can be updated.
     *
     * @param value The value being converted.
     * @returns {number} The converted value.
     */
    getInputValue: function (value) {
        var view = this.getView();
        return (value / view.getStep()) - view.getMin() + 1;
    }
});
