Ext.define('NU.store.ConfigurationTree', {
    extend: 'Ext.data.TreeStore',
    model: 'NU.model.Configuration',
    storeId: 'ConfigurationTree',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
