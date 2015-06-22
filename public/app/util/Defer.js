Ext.define('NU.util.Defer', {
	singleton: true,
	alternateClassName: 'NU.Defer',
	config: {
		highWaterMark: 50
	},
	constructor: function (config) {
		this.callbackIds = {};
		this.callbacks = [];
		this.initConfig(config);
		this.processCallback = this.process.bind(this);
	},
	defer: function (id, callback, minWait) {
		if (this.callbacks.length > this.getHighWaterMark()) {
			return false;
		}
		if (id in this.callbackIds) {
			return false;
		}
		this.callbackIds[id] = true;
		this.callbacks.push({
			id: id,
			callback: callback,
			minWait: minWait,
			time: performance.now()
		});
		if (this.callbacks.length === 1) {
			requestAnimationFrame(this.processCallback);
		}
		return true;
	},
	process: function () {
		var callback = this.callbacks[0];
		var call = false;
		if (performance.now() - callback.time >= callback.minWait) {
			delete this.callbackIds[callback.id];
			this.callbacks.shift();
			call = true;
		}
		if (this.callbacks.length > 0) {
			requestAnimationFrame(this.processCallback);
		}
		if (call) {
			callback.callback();
		}
	}
});
