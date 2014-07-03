Ext.define('NU.view.window.Vision', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_vision_window'],
    requires: [
		'Ext.ux.form.MultiSelect',
		'NU.view.LayeredCanvas'
	],
    controller: 'NU.controller.Vision',
    title: 'Vision Display',
    width: 454,
    height: 295,
//    resizable: {
//        preserveRatio: true
//    },
    layout: 'border',
    items: [{
        xtype: 'nu_layered_canvas',
        region: 'center',
        width: 320,
        height: 240,
        style: {
            backgroundColor: '#000'
//            backgroundImage: "url('resources/images/camera.png')",
//            backgroundRepeat: 'no-repeat',
//            backgroundPosition: 'center'
        },
        itemId: 'canvas'
    }, {
        region: 'east',
        width: 150,
        items: [{
            anchor: '100%',
            xtype: 'multiselect',
            width: 148,
            store: [
                ['raw', 'Raw Image'],
                ['classified', 'Classified Image'],
                ['objects', 'Field Objects']
            ],
            blankText: 'No items available',
            itemId: 'displaypicker'
        }]
    }]
});