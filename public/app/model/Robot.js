Ext.define('NU.model.Robot', {
    extend: 'Ext.data.Model',
    fields: [
        'ipAddress',
        'name',
        'enabled'
    ],
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