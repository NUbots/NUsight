Ext.define('NU.model.classifier.SelectionTool', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'}
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'

        }
    }
});