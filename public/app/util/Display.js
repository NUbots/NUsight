Ext.define('NU.util.Display', {
	singleton: true,
	cacheMap: {},
	updateDelayed: function (panel, value, time) {
		var cache = this.cacheMap;
		var panelId = panel.getId();

		if (cache[panelId] === undefined) {
			cache[panelId] = value;

			panel.update(cache[panelId]);
			setTimeout(function () {
				panel.update(cache[panelId]);
				delete cache[panelId];
			}, time);
		} else {
			cache[panelId] = value;
		}
	}
});