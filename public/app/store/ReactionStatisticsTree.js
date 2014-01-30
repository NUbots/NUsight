Ext.define('NU.store.ReactionStatisticsTree', {
    extend: 'Ext.data.TreeStore',
    model: 'NU.model.ReactionStatistic',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
