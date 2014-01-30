Ext.define('NU.Application', {
    extend: 'Deft.mvc.Application',
    requires: [
        'NU.view.Viewport'
    ],
    init: function () {
        window._NU = this;

        Deft.Injector.configure({
            streamsStore: 'NU.store.Streams',
            robotsStore: 'NU.store.Robots',
            reactionStatisticsTreeStore: 'NU.store.ReactionStatisticsTree'
        });

        Ext.create('NU.view.Viewport');
    }
});