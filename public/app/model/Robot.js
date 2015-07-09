Ext.define('NU.model.Robot', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'host', type: 'string'},
        {name: 'port', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'enabled', type: 'boolean', defaultValue: true},
        {name: 'recording', type: 'boolean', defaultValue: false}
    ],
    identifier: 'sequential',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: 'robots'
        }
    }
});