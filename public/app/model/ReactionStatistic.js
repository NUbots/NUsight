Ext.define('NU.model.ReactionStatistic', {
    extend: 'Ext.data.Model',
    fields: [
        'name',
        'reactionId',
        'taskId',
        'causeReactionId',
        'causeTaskId',
        'emitted',
        'started',
        'finished',
        'sumTime',
        'numTime'
    ]
});
