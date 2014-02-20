Ext.define('NU.Application', {
    extend: 'Deft.mvc.Application',
    requires: [
        'NU.view.Viewport',
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
            robotsStore: 'NU.store.Robots',
            reactionStatisticsTreeStore: 'NU.store.ReactionStatisticsTree',
            classifierTargetStore: 'NU.store.classifier.Target'
        });

        Ext.QuickTips.init();

        Ext.apply(Ext.QuickTips.getQuickTip(), {
            dismissDelay: 0
        });

        Ext.syncRequire('NU.util.Network');

        Ext.create('NU.view.Viewport');
    }
});
