/**
 * @author Monica Olejniczak
 */
Ext.define('NU.store.ConfigurationTree', {
    extend: 'Ext.data.TreeStore',
    storeId: 'ConfigurationTree',
    model: 'NU.model.Configuration',
    root: {
        expanded: true
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
