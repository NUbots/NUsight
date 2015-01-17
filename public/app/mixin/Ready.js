Ext.define('NU.mixin.Ready', {
	extend: 'Ext.Mixin',
	resolvers: null,
	promises: null,
	isReady: false,
	constructor: function () {
		this.resolvers = [];
		this.promises = [];
	},
	addReadyPromise: function (promise) {
		this.promises.push(promise);
	},
	onReady: function () {
		return new Promise(function (resolve) {
			if (this.isReady) {
				resolve();
			} else {
				this.resolvers.push(resolve);
			}
		}.bind(this));
	},
	ready: function () {
		Promise.all(this.promises).then(function () {
			this.isReady = true;
			Ext.each(this.resolvers, function (resolve) {
				resolve();
			}, this);
			this.resolvers = [];
			this.promises = [];
		}.bind(this));
	}
});
