Ext.define('NU.store.ConfigurationTree', {
    extend: 'Ext.data.TreeStore',
    model: 'NU.model.Configuration',
    storeId: 'ConfigurationTree',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    data: [{
        path: 'somepath',
        name: 'blah',
        type: 'TEXT',
        value: 'test',
        leaf: true
    }, {
        path: 'another path',
        name: 'blah',
        type: 'BOOLEAN',
        value: true,
        leaf: true
    }, {
        path: 'a path',
        name: 'blah',
        type: 'NUMBER',
        value: 5,
        leaf: true
    }, {
        path: 'a path',
        name: 'blah',
        type: 'SLIDER',
        value: 5,
        leaf: true
    }, {
        path: 'fifth path',
        name: 'blah',
        type: 'ANGLE',
        value: 5,
        leaf: true
    }]
});
