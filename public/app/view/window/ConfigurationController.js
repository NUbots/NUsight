Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    configurations: null,               // The view that contains the configurations
    store: null,
    type: null,                         // The protocol buffer enumeration
    requires: [
        'Ext.slider.Single'
    ],
    init: function () {
        this.configurations = this.getView().lookupReference('configurations');
        this.store = this.configurations.getStore();
        this.type = API.Configuration.Node.Type;
        this.mon(NU.util.Network, 'configuration_state', this.onConfigurationState, this);
        this.getConfigurationState();
    },
    onConfigurationState: function (robotIP, configurationState) {
        var root = configurationState.getRoot();
        this.processMessage(robotIP, root);
    },
    /**
     * Processes a message node.
     *
     * @param robotIP The IP address of the robot.
     * @param message The message node being processed.
     */
    processMessage: function (robotIP, message) {
        var type = message.type;
        switch (type) {
            case this.type.DIRECTORY:
                this.processDirectory(message.map_value);
                break;
            case this.type.NULL_VALUE:
                break;
            case this.type.STRING:
                break;
            case this.type.BOOLEAN:
                break;
            case this.type.LONG:
                break;
            case this.type.DOUBLE:
                break;
            case this.type.SEQUENCE:
                break;
            case this.type.MAP:
                break;
        }
    },
    /**
     * Processes a directory message.
     *
     * @param directory The message contents of the directory.
     */
    processDirectory: function (directory) {
        Ext.each(directory, function (file) {
            this.processFile(file);
        }, this);
    },
    processFile: function (file) {
        debugger;
        var path = file.name;
        this.store.add({
            path: path,
            name: this.transformName(path),
            type: 'TEXT',
            value: 'test',
            leaf: true
        });
    },
    /**
     * Returns the name of the type from the protocol buffer enumeration.
     *
     * @param type The integer type of the protocol node.
     * @returns {string} The name of the type from the enumeration.
     */
    getConfigurationType: function (type) {
        // default the result to unknown
        var result = 'UNKNOWN';
        // loop through each configuration protocol buffer enumeration
        Ext.Object.each(this.type, function (name, value) {
            // compare if the type being checked against is equivalent to the current enumeration
            if (type === value) {
                result = name;      // set the result to the name of the enumeration
                return false;       // exit the loop
            }
        }, this);
        return result;              // return the type of the configuration node
    },
    /**
     * Transforms the name to ensure it is valid by replacing any spaces with underscores.
     *
     * @param configuration The name of the configuration to transform so it is valid.
     * @returns {*} The new name of the configuration.
     */
    transformName: function (configuration) {
        return configuration.replace(/[./\- ]/g, '_');
    },
    /**
     * Removes a configuration for a particular robot.
     *
     * @param configuration The widget associated with a configuration to remove.
     */
    removeConfiguration: function (configuration) {
        configuration = this.transformReference(configuration);
        this.configurations.remove(this.configurations.lookupReference(configuration));
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
    }
    // todo: vectors
});
