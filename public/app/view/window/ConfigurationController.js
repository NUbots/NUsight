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
        var view = this.getView();
        this.configurations = view.lookupReference('configurations');
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
        // retrieve the store from the view
        var store = this.configurations.getStore();
        // processes the message using the store's root as the initial node
        this.processMessage(store.getRoot(), root);
    },
    /**
     * Processes a message node based on its message type.
     *
     * @param node The node to append children to.
     * @param message The message node being processed.
     */
    processMessage: function (node, message) {
        // retrieve the path, type and tag of the message
        var path = message.path;
        var type = message.type;
        var tag = this.parseTag(message.tag);
        // get the name from the node
        var name = node.get('name');
        // evaluate the message type
        switch ((tag && tag.name) || type) {
            case this.type.DIRECTORY:
            case this.type.FILE:
                this.processDirectory(node, message.map_value);
                break;
            case this.type.NULL_VALUE:
                this.processLeafNode(node, path, name, 'TEXT', message.null_value);
                break;
            case this.type.STRING:
                this.processLeafNode(node, path, name, 'TEXT', message.string_value);
                break;
            case this.type.BOOLEAN:
                this.processLeafNode(node, path, name, 'BOOLEAN', message.boolean_value);
                break;
            case this.type.LONG:
                this.processLeafNode(node, path, name, 'NUMBER', message.long_value);
                break;
            case this.type.DOUBLE:
                this.processLeafNode(node, path, name, 'NUMBER', message.double_value);
                break;
            case this.type.SEQUENCE:
                this.processSequence(node, message.sequence_value);
                break;
            case this.type.MAP:
                this.processMap(node, message.map_value);
                break;
            case "ANGLE":
                this.processAngle(node, path, name, message.double_value || message.long_value);
                break;
            case "SLIDER":
                this.processSlider(node, path, name, message.double_value || message.long_value, tag.params);
                break;
            case "COMBO":
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
        if (tag !== null && tag !== "?" && tag != "!") {
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
            this.processMessage(node.appendChild({
                name: this.transformName(item.name)
            }), item.value);
        }, this);
    },
    /**
     * Processes a leaf node by creating a new child node with all of the relevant information.
     *
     * @param node The node that is to be replaced.
     * @param path The path to the configuration file.
     * @param name The name of the configuration.
     * @param type The type of the leaf node. This can be a textfield, numberfield or checkbox.
     * @param value The value of the leaf node.
     */
    processLeafNode: function (node, path, name, type, value) {
        this.processCurrentNode(node, {
            path: path,
            name: name,
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
        Ext.each(sequence, function (item, i) {
            // TODO add unique name
            // processes the sequence message
            this.processMessage(node.appendChild({
                name: i
            }), item);
        }, this);
    },
    /**
     * Processes a map message.
     *
     * @param node The node to append the child to.
     * @param map The map message.
     */
    processMap: function (node, map) {
        // iterates through every map item
        Ext.each(map, function (item) {
            // processes the message and its map value
            this.processMessage(node.appendChild({
                name: this.transformName(item.name)
            }), item.value);
        }, this);
    },
    /**
     * Processes an angle tag.
     *
     * @param node The node that is to be replaced.
     * @param path The path to the configuration file.
     * @param name The name of the configuration.
     * @param value The current value of the angle in radians.
     */
    processAngle: function (node, path, name, value) {
        // convert the value from radians to degrees
        value = value * 180 / Math.PI;
        this.processCurrentNode(node, {
            path: path,
            name: name,
            type: 'ANGLE',
            value: value,
            leaf: true
        });
    },
    /**
     * Processes a slider tag.
     *
     * @param node The node that is to be replaced.
     * @param path The path to the configuration file.
     * @param name The name of the configuration.
     * @param value The current value of the slider.
     * @param params The parameters associated with the slider.
     */
    processSlider: function (node, path, name, value, params) {
        // get the values from the slider params
        var minValue = params[0];
        var maxValue = params[1];
        var increment = params[2];
        // process the current node using the new child object
        this.processCurrentNode(node, {
            path: path,
            name: name,
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
     * Transforms the name to ensure it is valid by replacing any spaces with underscores.
     *
     * @param configuration The name of the configuration to transform so it is valid.
     * @returns {*} The new name of the configuration.
     */
    transformName: function (configuration) {
        return configuration.replace(/[./\- ]/g, '_');
    },
    /**
     * Updates a configuration file with a new value based off the information found in the record.
     *
     * @param record The record associated with a particular widget that was updated.
     * @param value The new value of the widget.
     */
    onUpdateWidget: function (record, value) {
        debugger;
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
