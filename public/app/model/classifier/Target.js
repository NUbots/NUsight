Ext.define('NU.model.classifier.Target', {
    extend: 'Ext.data.Model',
    fields: [
        'name'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'

        }
    }
});