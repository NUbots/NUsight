Ext.define('NU.store.classifier.SelectionTool', {
    extend: 'Ext.data.Store',
    requires: 'NU.model.classifier.SelectionTool',
    model: 'NU.model.classifier.SelectionTool',
    data: [{
        id: 'point',
        name: 'Point'
    }, {
        id: 'magic_wand',
        name: 'Magic Wand'
    }, {
        id: 'polygon',
        name: 'Polygon'
    }]
});
