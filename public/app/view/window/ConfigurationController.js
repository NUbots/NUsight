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
     * A function called when the configuration window is initialised. It sends a message over the network requesting
     * the data for each configuration.
     */
    getConfigurationState: function () {
        NU.util.Network.sendCommand(this.getRobotIP(), "get_configuration_state");
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
        // retrieve the type and tag of the message
        var type = message.type;
        var tag = this.parseTag(message.tag);
        // evaluate the message type
        switch ((tag && tag.name) || type) {
            case this.type.DIRECTORY:
            case this.type.FILE:
            case this.type.MAP:
                this.processMap(node, message.map_value);
                break;
            case this.type.LONG:
                this.processLeafNode(node, 'NUMBER', message.long_value);
                break;
            case this.type.DOUBLE:
                this.processLeafNode(node, 'NUMBER', message.double_value);
                break;
            case this.type.BOOLEAN:
                this.processLeafNode(node, 'BOOLEAN', message.boolean_value);
                break;
            case this.type.STRING:
                this.processLeafNode(node, 'TEXT', message.string_value);
                break;
            case this.type.SEQUENCE:
                this.processSequence(node, message.sequence_value);
                break;
            case this.type.NULL_VALUE:
                this.processLeafNode(node, 'TEXT', message.null_value);
                break;
            case "ANGLE":
                this.processAngle(node, message.double_value || message.long_value);
                break;
            case "SLIDER":
                this.processSlider(node, message.double_value || message.long_value, tag.params);
                break;
            case "COMBO":
                // TODO
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
     * Processes a leaf node by creating a new child node with all of the relevant information.
     *
     * @param node The node that is to be replaced.
     * @param type The type of the leaf node. This can be a textfield, numberfield or checkbox.
     * @param value The value of the leaf node.
     */
    processLeafNode: function (node, type, value) {
        this.processCurrentNode(node, {
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
                name: item.name,
                path: item.path
            }), item.value);
        }, this);
    },
    /**
     * Processes an angle tag.
     *
     * @param node The node that is to be replaced.
     * @param value The current value of the angle in radians.
     */
    processAngle: function (node, value) {
        // convert the value from radians to degrees
        value = value * 180 / Math.PI;
        this.processCurrentNode(node, {
            name: node.get('name'),
            type: 'ANGLE',
            value: value,
            leaf: true
        });
    },
    /**
     * Processes a slider tag.
     *
     * @param node The node that is to be replaced.
     * @param value The current value of the slider.
     * @param params The parameters associated with the slider.
     */
    processSlider: function (node, value, params) {
        // get the values from the slider params
        var minValue = params[0];
        var maxValue = params[1];
        var increment = params[2];
        // process the current node using the new child object
        this.processCurrentNode(node, {
            name: node.get('name'),
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
     * Updates a configuration file with a new value based off the information found in the record.
     *
     * @param record The record associated with a particular widget that was updated.
     * @param value The new value of the widget.
     */
    onUpdateWidget: function (record, value) {
        // create the configuration state message
        var message = NU.util.Network.createMessage(API.Message.Type.CONFIGURATION_STATE, 0);
        // calculates the configuration given the record and value being updated
        var configuration = this.getConfiguration(record, value);
        // set the configuration of the message
        message.setConfiguration(configuration);
        // send the message over the network
        NU.util.Network.send(this.getRobotIP(), message);
    },
    getConfiguration: function (record, value) {
        var configuration = new API.Configuration();        // create the configuration API
        var records = [];                                   // create an empty array of records
        record.bubble(function () {                         // loop through each parent of the record
            var record = arguments[0];                      // get the current record
            records.unshift(record);                        // add the record to the start of the array
            if (record.get('path')) {                       // check if a path exists on the record
                return false;                               // escape the bubble function as no more parents are needed
            }
        });
        var root = this.createFileNode(records.shift());    // create the FILE Node using the first item in the records list
        var node = root.getMapValue()[0].getValue();        // get the node being modified
        configuration.setRoot(root);                        // set the root of the configuration buffer
        debugger;
        Ext.each(records, function (record, i) {
            debugger;
        });
    },
    /**
     * Creates a Node given a particular type.
     *
     * @param type The type of node to create.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    createNode: function (type) {
        var node = new API.Configuration.Node;              // create the Configuration Node
        node.setType(type);                                 // set its type
        return node;                                        // return the Node that was created
    },
    /**
     * Creates a FILE type Node given the record data.
     *
     * @param record The record to obtain data from.
     * @returns {spec.Node} A file ConfigurationState Node.
     */
    createFileNode: function (record) {
        var node = this.createNode(this.type.FILE);         // create the FILE Node
        var map = new API.Configuration.KeyPair;            // create the map associated with the Node
        map.setName(record.get('name'));                    // set the name of the map to the file name
        map.setValue(new API.Configuration.Node);           // set the value of the map to an initialised Node
        map.setPath(record.get('path'));                    // set the path of the map to the configuration path
        node.getMapValue().push(map);                       // append the map to the Node
        return node;                                        // return the Node that was created
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
    // TODO: vectors
});
