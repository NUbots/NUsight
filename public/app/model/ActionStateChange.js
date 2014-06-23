Ext.define('NU.model.ActionStateChange', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'id', type: 'int'},
		{name: 'robotIP', type: 'string'},
		{name: 'time', type: 'date'},
		{name: 'name', type: 'string'},
		{name: 'limbs', type: 'auto'}, // array of int
		{name: 'state', type: 'int'}
	],
	proxy: {
		type: 'memory',
		reader: {
			type: 'json'
		}
	},
	getStateDescription: function () {
		var result = "unknown";
		var state = this.get('state');
		var State = API.ActionStateChange.State;
		Ext.Object.each(State, function (name, value) {
			if (state === value) {
				result = name;
				return false;
			}
		}, this);

		return result;
	},
	getLimbNames: function () {
		var limbs = this.get('limbs');

		var output = [];
		limbs.forEach(function (limbID) {
			output.push(this.getLimbName(limbID));
		}, this);

		return this.arrayToSentence(output);
	},
	getLimbName: function (limbID) {
		switch (limbID) {
			case 0: return 'Left Leg';
			case 1: return 'Right Leg';
			case 2: return 'Left Arm';
			case 3: return 'Right Arm';
			case 4: return 'Head';
		}
	},
	arrayToSentence: function (arr) {
		if (arr.length < 1) {
			return '';
		} else if (arr.length === 1) {
			return arr[0];
		} else {
			return arr.slice(0, arr.length - 1).join(', ') + ' and ' + arr.slice(-1);
		}
	}
});
