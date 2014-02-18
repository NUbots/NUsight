Ext.define('NU.store.classifier.Target', {
    extend: 'Ext.data.Store',
    requires: 'NU.model.classifier.Target',
    model: 'NU.model.classifier.Target',
    data: [{
        name: 'Goal'
    }, {
        name: 'Field'
    }, {
        name: 'Ball'
 }]
});