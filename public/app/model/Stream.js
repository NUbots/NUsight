Ext.define('NU.model.Stream', {
    extend: 'Ext.data.Model',
    fields: [
        'label',
        'size',
        'series',
        'enabled'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: 'streams'
        }
    }
});
