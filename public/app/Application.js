Ext.define('NU.Application', {
    extend: 'Deft.mvc.Application',
    requires: [
        'NU.view.Viewport',
        'NU.util.Network',
        'NU.store.Robots',
        'NU.store.Streams',
        'NU.store.ReactionStatisticsTree',
    ],
    init: function () {
        window._NU = this;

        Deft.Injector.configure({
            streamsStore: {
                className: 'NU.store.Streams',
                singleton: false
            },
            robotsStore: {
                className: 'NU.store.Robots',
                singleton: true
            },
            reactionStatisticsTreeStore: 'NU.store.ReactionStatisticsTree'
        });

        Ext.QuickTips.init();

        Ext.create('NU.view.Viewport');
    }
});