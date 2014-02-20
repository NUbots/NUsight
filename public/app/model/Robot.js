Ext.define('NU.model.Robot', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'ipAddress', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'enabled', type: 'boolean', defaultValue: true},
    ],
    idgen: 'sequential',
    validations: [
        {type: 'presence', name: 'ipAddress'},
        {type: 'format', name: 'ipAddress', matcher: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/}
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'robots'
        }
    }
});