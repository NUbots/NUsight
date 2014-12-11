/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    configurations: null,               // The view that contains the configurations
    type: null,                         // The protocol buffer enumeration
    requires: [
        'Ext.slider.Single'
    ],
    init: function () {
        this.configurations = this.getView().lookupReference('configurations');
        this.type = API.Configuration.Node.Type;
        this.mon(NU.util.Network, 'configuration_state', this.onConfigurationState, this);
        this.getConfigurationState();
    },
    /**
     * An event fired when the network has received the configuration state message.
     *
     * @param robotIP The robot IP address.
     * @param configurationState The configuration state protocol buffer.
     */
    onConfigurationState: function (robotIP, configurationState) {
        // retrieves the root from the buffer
        var root = configurationState.getRoot();
        // processes the message using the store's root as the initial node
        this.processMessage(this.configurations.getStore().getRoot(), root);
    },
    /**
     * Processes a message node based on its message type.
     *
     * @param node The node to append children to.
     * @param message The message node being processed.
     */
    processMessage: function (node, message) {
        // retrieve the type and tag of the message
        var type = message.type;
        var tag = this.parseTag(message.tag);
        // evaluate the message type
        switch ((tag && tag.name) || type) {
            case this.type.DIRECTORY:
                this.processDirectory(node, message.map_value);
                break;
            case this.type.NULL_VALUE:
                this.processLeafNode(node, 'TEXT', message.null_value);
                break;
            case this.type.STRING:
                this.processLeafNode(node, 'TEXT', message.string_value);
                break;
            case this.type.BOOLEAN:
                this.processLeafNode(node, 'BOOLEAN', message.boolean_value);
                break;
            case this.type.LONG:
                this.processLeafNode(node, 'NUMBER', message.long_value);
                break;
            case this.type.DOUBLE:
                this.processLeafNode(node, 'NUMBER', message.double_value);
                break;
            case this.type.SEQUENCE:
                this.processSequence(node, message.sequence_value);
                break;
            case this.type.MAP:
                this.processMap(node, message.map_value);
                break;
            case "ANGLE":
                debugger;
                break;
            case "SLIDER":
                this.processSlider(node, message.double_value || message.long_value, tag.params);
                break;
            case "COMBO":
                debugger;
                break;
        }
    },
    /**
     * Parses a YAML tag to conform to the format "!<NAME(optional,params)> value".
     *
     * @param tag The tag to parse.
     * @returns {*} The parsed tag in JSON.
     */
    parseTag: function (tag) {
        // checks if the tag exists
        if (tag !== null) {
            // create a regex that splits the YAML tag into two components <NAME><PARAMS>
            var regex = /(\w+)(?:\((.+)\))?/;
            // executes the regex on the tag
            var matches = regex.exec(tag);
            // assigns the name and params of the tag
            var name = matches[1].toUpperCase();
            var params = matches[2];
            // checks if the params exist
            if (params !== undefined) {
                // replaces any "(" and ")" with "{" and "}" respectively and stringifies the params
                params = params.replace(/\(/g, "{").replace(/\)/g, "}").replace(/([A-Za-z]\w*)/g, '"$1"');
            }
            // returns the tag with its respective name and params which are converted to JSON
            return {
                name: name,
                params: JSON.parse(Ext.String.format('[{0}]', params))
            };
        }
        return null;
    },
    /**
     * TODO: Remove?
     * Processes a directory message.
     *
     * @param node The node to append children to.
     * @param directory The message contents of the directory.
     */
    processDirectory: function (node, directory) {
        Ext.each(directory, function (item) {
            var path = item.name;
            this.processMessage(node.appendChild({
                path: path,
                name: this.transformName(path)
            }), item.value);
        }, this);
    },
    /**
     * Processes a leaf node by creating a new child node with all of the relevant information.
     *
     * @param node The node that is to be replaced.
     * @param type The type of the leaf node. This can be a textfield, numberfield or checkbox.
     * @param value The value of the leaf node.
     */
    processLeafNode: function (node, type, value) {
        this.processCurrentNode(node, {
            path: node.get('path'),
            name: node.get('name'),
            type: type,
            value: value,
            leaf: true
        });
    },
    /**
     * Processes the current node by retrieving its parent and appending a child with all of the relevant information
     * for the new child node. The original child node is then removed as it does not store all of the necessary
     * information.
     *
     * @param node The node that is to be replaced.
     * @param child The new child node.
     */
    processCurrentNode: function (node, child) {
        var parent = node.parentNode;
        parent.appendChild(child);
        parent.removeChild(node);
    },
    /**
     * Processes a sequence message.
     *
     * @param node The node to append the child to.
     * @param sequence The sequence message.
     */
    processSequence: function (node, sequence) {
        // iterates through every sequence message
        Ext.each(sequence, function (item) {
            // TODO add unique name
            // processes the sequence message
            this.processMessage(node.appendChild({}), item);
        }, this);
    },
    /**
     * Processes a map message.
     *
     * @param node The node to append the child to.
     * @param map The map message.
     */
    processMap: function (node, map) {
        Ext.each(map, function (item) {
            var path = item.name;
            this.processMessage(node.appendChild({
                path: path,
                name: this.transformName(path)
            }), item.value);
        }, this);
    },
    /**
     * Processes a slider tag.
     *
     * @param node The node that is to be replaced.
     * @param value The current value of the slider.
     * @param params The parameters associated with the slider.
     */
    processSlider: function (node, value, params) {
        var minValue = params[0];
        var maxValue = params[1];
        var increment = params[2];
        this.processCurrentNode(node, {
            type: 'SLIDER',
            value: {
                value: value,
                minValue: minValue,
                maxValue: maxValue,
                increment: increment
            },
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
    // TODO: vectors
});
