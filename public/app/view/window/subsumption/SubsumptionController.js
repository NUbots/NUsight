Ext.define('NU.view.window.subsumption.SubsumptionController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Subsumption',
	init: function () {
		var viewModel = this.getViewModel();
		this.actions = viewModel.getStore('ActionRegister');
		this.logs = viewModel.getStore('ActionStateChange');
		NU.Network.sendCommand(this.getRobotId(), 'get_subsumption');
		this.mon(NU.Network, 'subsumption', this.onSubsumption, this);
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

	onClose: function () {
		this.onClearActionTable();
		this.onClearStateLog();
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

		this.processActionRegisters(robotId, event.getActionRegister(), timestamp);
		this.processActionStateChanges(robotId, event.getActionStateChange(), timestamp);
		this.processActionPriorityChanges(robotId, event.getActionPriorityChange(), timestamp);

	},

	processActionRegisters: function (robotId, actionRegisters, timestamp) {
		Ext.each(actionRegisters, function (actionRegister) {
			this.addActionRegister(robotId, actionRegister, timestamp);
		}, this);
	},

	addActionRegister: function (robotId, actionRegister, timestamp) {
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

	processActionStateChanges: function (robotId, actionStateChanges, timestamp) {
		Ext.each(actionStateChanges, function (actionStateChange) {
			this.addActionStateChange(robotId, actionStateChange, timestamp);
		}, this);
	},

	addActionStateChange: function (robotId, actionStateChange, timestamp) {
		this.logs.add({
			robotId: robotId,
			time: timestamp,
			name: actionStateChange.getName(),
			limbs: actionStateChange.getLimbs(),
			state: actionStateChange.getState()
		});
	},

	processActionPriorityChanges: function (robotId, actionPriorityChanges, timestamp) {
		Ext.each(actionPriorityChanges, function (actionPriorityChange) {
			this.addActionPriorityChange(robotId, actionPriorityChange, timestamp);
		}, this);
	},

	addActionPriorityChange: function (robotId, actionPriorityChange, timestamp) {
		if (this.actions.getCount() > 0) {
			var priorities = actionPriorityChange.getPriorities();
			var actions = this.actions.query('actionId', actionPriorityChange.getId());
			actions.each(function (action, i) {
				action.set('priority', priorities[i]);
			}, this);
		}
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
