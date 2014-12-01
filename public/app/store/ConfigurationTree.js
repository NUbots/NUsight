Ext.define('NU.store.ConfigurationTree', {
    extend: 'Ext.data.TreeStore',
    model: 'NU.model.Configuration',
    storeId: 'Configuration',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    data: [{
        path: 'somepath',
        name: 'blah',
        value: 'test'
    }]
});
