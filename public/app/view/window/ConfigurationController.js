Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    configurations: null,
    requires: [
        'Ext.slider.Single'
    ],
    init: function () {
        this.configurations = this.getView().lookupReference('configurations');
        this.getConfigurationState();
    },
    getConfigurationState: function () {
        // TODO: put this in network
        var message = new API.Message();
        message.setType(API.Message.Type.COMMAND);
        message.setFilterId(0);
        message.setUtcTimestamp(Date.now() / 1000);
        var command = new API.Message.Command();
        command.setCommand("get_configuration_state");
        message.setCommand(command);
        NU.util.Network.send(this.getRobotIP(), message);
    },
    /**
     * Removes a configuration for a particular robot.
     *
     * @param configuration The widget associated with a configuration to remove.
     */
    removeConfiguration: function (configuration) {
        configuration = this.transformReference(configuration);
        this.configurations.remove(this.configurations.lookupReference(configuration));
    }
    // todo: angles, sliders, vectors
});
