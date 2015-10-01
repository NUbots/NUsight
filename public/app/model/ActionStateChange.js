Ext.define('NU.model.ActionStateChange', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'id', type: 'int'},
		{name: 'robotId', type: 'int'},
		{name: 'time', type: 'date'},
		{name: 'name', type: 'string'},
		{name: 'limbs', type: 'auto'}, // array of int
		{name: 'state', type: 'int'}
	],
	getStateDescription: function () {
		var result = "unknown";
		var state = this.get('state');
		var State = API.messages.behaviour.proto.Subsumption.ActionStateChange.State;
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
		var Limb = API.messages.behaviour.proto.Subsumption.Limb;
		switch (limbID) {
			case Limb.LEFT_LEG: return 'Left Leg';
			case Limb.RIGHT_LEG: return 'Right Leg';
			case Limb.LEFT_ARM: return 'Left Arm';
			case Limb.RIGHT_ARM: return 'Right Arm';
			case Limb.ARM: return 'Head';
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
