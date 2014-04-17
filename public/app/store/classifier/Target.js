Ext.define('NU.store.classifier.Target', {
    extend: 'Ext.data.Store',
    requires: 'NU.model.classifier.Target',
    model: 'NU.model.classifier.Target',
    data: [{
        name: 'Unclassified'
    }, {
        name: 'Goal'
    }, {
        name: 'Field'
    }, {
        name: 'Ball'
    }, {
        name: 'Line'
    }]
});