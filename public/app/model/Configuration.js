/**
 * @author Monica Olejniczak
 */
Ext.define('NU.model.Configuration', {
    extend: 'Ext.data.Model',
    fields: [
        'path',     // The path to the configuration file
        'name',     // The name of the configuration
        'type',     // The type of the configuration i.e. file, directory, sequence, etc
        'widget',   // The type of widget associated with the configuration
        'value'     // The value of the configuration
    ]
});
