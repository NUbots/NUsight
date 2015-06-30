Ext.define('NU.util.TypeMap', {
	singleton: true,
	alternateClassName: 'NU.TypeMap',
	constructor: function () {
		this.typeMaps = {};
	},
	/**
	 * Reverses an object so that [key]: [value] maps to [value]: [key].
	 *
	 * @param type The object to reverse.
	 * @returns {*}
	 */
	get: function (type) {
		// Retrieve the type map based using the type key.
		var typeMap = this.typeMaps[type];
		// Check if a cached type map does not exist.
		//if (!typeMap) {
			// Create and cache the type map.
			typeMap = this.typeMaps[type] = {};
			Ext.Object.each(type, function (key, value) {
				typeMap[value] = key;
			});
		//}
		return typeMap;
	}
});
