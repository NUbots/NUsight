Ext.define('NU.view.window.subsumption.SubsumptionController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Subsumption',
	init: function () {
		var viewModel = this.getViewModel();
		this.actions = viewModel.getStore('ActionRegister');
		this.logs = viewModel.getStore('ActionStateChange');
		NU.Network.on('subsumption', this.onSubsumption.bind(this));
	},

	getCellClass: function (value, record, index) {
		var state = record.get('state');
		if (value.indexOf(index) >= 0) {
			if (state === API.Subsumption.ActionStateChange.State.START || record.store === this.actions) {
				return 'action-start';
			} else {
				return 'action-kill';
			}
		} else {
			return '';
		}
	},

	onClearActionTable: function () {
		this.actions.removeAll();
	},

	onClearStateLog: function () {
		this.logs.removeAll();
	},

	onSubsumption: function (robotId, event, timestamp) {
		// TODO: remove
		if (robotId !== this.getRobotId()) {
			return;
		}

		var type = event.getType();
		switch (type) {
			case API.Subsumption.Type.ACTION_REGISTER:
				this.onActionRegister(robotId, event.getActionRegister(), timestamp);
				break;
			case API.Subsumption.Type.ACTION_STATE:
				this.onActionStateChange(robotId, event.getActionStateChange(), timestamp);
				break;
			case API.Subsumption.Type.ACTION_PRIORITY_CHANGE:
				this.onActionPriorityChange(robotId, event.getActionPriorityChange(), timestamp);
				break;
			default:
				console.error('Unknown behaviour type: ', type);
		}
	},

	onActionRegister: function (robotId, actionRegister, timestamp) {
		var id = actionRegister.getId();
		var name = actionRegister.getName();
		Ext.each(actionRegister.getLimbSet(), function (limbSet) {
			this.actions.add({
				actionId: id,
				robotId: robotId,
				time: timestamp,
				name: name,
				limbs: limbSet.getLimbs(),
				priority: limbSet.getPriority()
			});
		}, this);
	},

	onActionStateChange: function (robotId, stateActionChange, timestamp) {
		this.logs.add({
			robotId: robotId,
			time: timestamp,
			name: stateActionChange.getName(),
			limbs: stateActionChange.getLimbs(),
			state: stateActionChange.getState()
		});
	},

	onActionPriorityChange: function (robotId, actionPriorityChange, timestamp) {
		console.log('priotity change', actionPriorityChange.getId());
		var priorities = actionPriorityChange.getPriorities();
		var actions = this.actions.query('actionId', actionPriorityChange.getId());
		actions.each(function (action, i) {
			action.set('priority', priorities[i]);
		}, this);
	},

	onRenderState: function (value, metaData, record) {
		return record.getStateDescription();
	},

	renderColumn: function (value, metaData, record, index) {
		metaData.tdCls = metaData.tdCls + ' ' + this.getCellClass(value, record, index);
		return '';
	},

	onRenderLeftLeg: function (value, metaData, record) {
		this.renderColumn(value, metaData, record, API.Subsumption.Limb.LEFT_LEG);
	},

	onRenderRightLeg: function (value, metaData, record) {
		this.renderColumn(value, metaData, record, API.Subsumption.Limb.RIGHT_LEG);
	},

	onRenderLeftArm: function (value, metaData, record) {
		this.renderColumn(value, metaData, record, API.Subsumption.Limb.LEFT_ARM);
	},

	onRenderRightArm: function (value, metaData, record) {
		this.renderColumn(value, metaData, record, API.Subsumption.Limb.RIGHT_ARM);
	},

	onRenderHead: function (value, metaData, record) {
		this.renderColumn(value, metaData, record, API.Subsumption.Limb.HEAD);
	}

});
