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
        NU.util.Network.sendCommand(this.getRobotIP(), 'get_configuration_state');
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
                this.processMap(node, type, message.map_value);
                break;
            case this.type.LONG:
                this.processLeafNode(node, type, 'NUMBER', message.long_value);
                break;
            case this.type.DOUBLE:
                this.processLeafNode(node, type, 'NUMBER', message.double_value);
                break;
            case this.type.BOOLEAN:
                this.processLeafNode(node, type, 'BOOLEAN', message.boolean_value);
                break;
            case this.type.STRING:
                this.processLeafNode(node, type, 'TEXT', message.string_value);
                break;
            case this.type.SEQUENCE:
                this.processSequence(node, type, message.sequence_value);
                break;
            case this.type.NULL_VALUE:
                this.processLeafNode(node, type, 'TEXT', message.null_value);
                break;
            case "ANGLE":
                this.processAngle(node, type, message.double_value || message.long_value);
                break;
            case "SLIDER":
                this.processSlider(node, type, message.double_value || message.long_value, tag.params);
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
     * Processes a leaf node by creating a new node with all of the relevant information.
     *
     * @param node The node that is being processed.
     * @param type The YAML node type.
     * @param widget The type of widget being used for the leaf node. This can be a textfield, numberfield or checkbox.
     * @param value The value of the leaf node.
     */
    processLeafNode: function (node, type, widget, value) {
        this.processCurrentNode(node, {
            name: node.get('name'),
            type: type,
            widget: widget,
            value: value,
            leaf: true
        });
    },
    /**
     * Processes the current node by retrieving its parent and appending a child (newNode) with all of the relevant
     * information for the new current node. The original child node (oldNode) is then removed as it does not store
     * all of the necessary information.
     *
     * @param oldNode The node that is to be replaced.
     * @param newNode The new current node.
     * @returns {*} The new current node.
     */
    processCurrentNode: function (oldNode, newNode) {
        // check that the node being replace is not the root
        if (!oldNode.isRoot()) {
            var parent = oldNode.parentNode;
            var node = parent.appendChild(newNode);
            parent.removeChild(oldNode);
            return node;
        }
        return oldNode;
    },
    /**
     * Processes a sequence message.
     *
     * @param node The sequence node.
     * @param type The YAML node type.
     * @param sequence The sequence message.
     */
    processSequence: function (node, type, sequence) {
        node = this.processCurrentNode(node, {
            name: node.get('name'),
            type: type
        });
        // iterates through every sequence message
        Ext.each(sequence, function (item, i) {
            // processes the sequence message
            this.processMessage(node.appendChild({}), item);
        }, this);
    },
    /**
     * Processes a map message.
     *
     * @param node The map node.
     * @param type The YAML node type.
     * @param map The map message.
     */
    processMap: function (node, type, map) {
        // iterates through every map item
        Ext.each(map, function (item) {
            // processes the message and its map value
            this.processMessage(node.appendChild({
                name: item.name,
                path: item.path,
                type: type
            }), item.value);
        }, this);
    },
    /**
     * Processes an angle tag of the format !<ANGLE>
     *
     * @param node The node that is to be replaced.
     * @param type The YAML node type.
     * @param value The current value of the angle in radians.
     */
    processAngle: function (node, type, value) {
        // convert the value from radians to degrees
        value = value * 180 / Math.PI;
        this.processCurrentNode(node, {
            name: node.get('name'),
            type: type,
            widget: 'ANGLE',
            value: value,
            leaf: true
        });
    },
    /**
     * Processes a slider tag of the format <!SLIDER(MIN,MAX,STEP)>.
     *
     * @param node The node that is to be replaced.
     * @param type The YAML node type.
     * @param value The current value of the slider.
     * @param params The parameters associated with the slider.
     */
    processSlider: function (node, type, value, params) {
        // get the values from the slider params
        var minValue = params[0];
        var maxValue = params[1];
        var increment = params[2];
        // process the current node using the new object
        this.processCurrentNode(node, {
            name: node.get('name'),
            type: type,
            widget: 'SLIDER',
            value: {
                value: value,
                minValue: minValue,
                maxValue: maxValue,
                increment: increment
            },
            leaf: true
        });
    },
    getRecordValue: function (record) {
        var value = record.get('value');
        if (record.get('widget') === 'ANGLE') {
            return value.value;
        }
        return value;
    },
    /**
     * Updates a configuration file with a new value based off the information found in the record.
     *
     * @param record The record associated with a particular widget that was updated.
     * @param newValue The new value of the configuration.
     */
    onUpdateWidget: function (record, newValue) {
        // get the value of the record
        var value = this.getRecordValue(record);
        var type = record.get('type');
        // check if we should even update the configuration file first
        if (value !== newValue) {
            // create the configuration state message
            var message = NU.util.Network.createMessage(API.Message.Type.CONFIGURATION_STATE, 0);
            // calculates the configuration given the record and value being updated
            var configurationState = this.getConfiguration(record, newValue);
            // set the configuration state of the message
            message.setConfigurationState(configurationState);
            // send the message over the network
            NU.util.Network.send(this.getRobotIP(), message);
        }
    },
    /**
     * Retrieves the ConfigurationState message by building the tree and setting its root.
     *
     * @param record The record that was modified by the user.
     * @param newValue The new value for the configuration.
     * @returns {Window.API.Configuration} The ConfigurationState message.
     */
    getConfiguration: function (record, newValue) {
        var configuration = new API.Configuration();        // create the configuration API
        var tree = this.buildTree(record, newValue);        // build the tree using the initial record
        configuration.setRoot(tree.root);                   // set the root of the configuration message
        return configuration;                               // return the configuration message
    },
    /**
     * Recursively builds the Configuration State message. It keeps on going up the tree until a file is found (i.e. a
     * path exists) and then creates a node using the current data and appends it to the current value of the tree.
     *
     * @param node The current node being processed.
     * @param newValue The new value for the configuration.
     * @returns {*} The ConfigurationState message tree.
     */
    buildTree: function (node, newValue) {
        if (node.get('path')) {                             // check if the node contains a path
            var root = this.createFileNode(node);           // create the file node
            return {                                        // return an object containing the root and the file as the current value
                root: root.node,
                current: root.file
            }
        }
        // build the tree recursively using the parent node until the file is found
        var tree = this.buildTree(node.parentNode, newValue);
        // create the proto node
        var newNode = this.processNode(node, newValue);
        var current = tree.current;                         // get the current node in the tree
        var type = current.type;                            // get the type of the current node in the tree
        if (type === this.type.MAP) {                       // check if the type of the current node is a map
            var map = current.getMapValue()[0];             // get the first map from the current node in the tree
            var mapValue = map.getValue();                  // get the value of the map
            if (mapValue ) {                                // check if the value in the map exists
                mapValue.setSequenceValue(newNode);         // must be a sequence
            } else {
                map.setValue(newNode);                      // must be another map
            }
        } else if (type === this.type.SEQUENCE) {           // check if the type of the current node is a sequence
            current.setSequenceValue(newNode);              // set the sequence value of the current tree
        } else {
            current.setValue(newNode);                      // append the new node as a KeyPair value
        }
        // set the new current node in the tree to the node that was created and return the tree
        tree.current = newNode;
        return tree;
    },
    /**
     * Retrieves the data from the node that is being processed, then evaluates its type to build a protocol buffer
     * message Node or KeyPair.
     *
     * @param node The node being processed.
     * @param newValue The new value for the configuration.
     * @returns {*} A ConfigurationState Node or KeyPair.
     */
    processNode: function (node, newValue) {
        var name = node.get('name');                        // get the name of the record
        var value = node.get('value');                      // get the value of the record
        var type = node.get('type');                        // get the type of the record
        if (!node.hasChildNodes()) {                        // check if at the widget node
            value = newValue;                               // change the value to new configuration value
        }
        switch (type) {                                     // evaluate the type of the record
            case this.type.MAP:
                return this.createMapNode(this.createKeyPair(name));
            case this.type.LONG:
                return this.createLongNode(name, value);
            case this.type.DOUBLE:
                return this.createDoubleNode(name, value);
            case this.type.BOOLEAN:
                return this.createBooleanNode(name, value);
            case this.type.STRING:
                return this.createStringNode(name, value);
            case this.type.SEQUENCE:
                return this.createSequenceNode(name);
            case this.type.NULL_VALUE:
                return this.createNullNode(name);
        }
    },
    /**
     * Creates a KeyPair given the name, value and an optional path.
     *
     * @param name The name of the Key Pair.
     * @param [value] The Node value of the Key Pair.
     * @param [path] The path to the file or directory.
     */
    createKeyPair: function (name, value, path) {
        var keyPair = new API.Configuration.KeyPair;        // create the KeyPair
        keyPair.setName(name);                              // set the name of the KeyPair
        if (value) {                                        // check if the value was passed in
            keyPair.setValue(value);                        // set the value of the KeyPair
        }
        if (path) {                                         // check if the path was passed in
            keyPair.setPath(path);                          // set the path of the keyPair if it exists
        }
        return keyPair;                                     // return the KeyPair that was created
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
     * @returns {{node: spec.Node, file: API.Configuration.KeyPair}} The file node and its map value.
     */
    createFileNode: function (record) {
        var node = this.createNode(this.type.FILE);         // create the FILE Node
        var map = new API.Configuration.KeyPair;            // create the map associated with the Node
        map.setName(record.get('name'));                    // set the name of the map to the file name
        map.setValue(new API.Configuration.Node);           // set the value of the map to an initialised Node
        map.setPath(record.get('path'));                    // set the path of the map to the configuration path
        node.getMapValue().push(map);                       // append the map to the Node
        return {                                            // return the Node and KeyPair
            node: node,
            file: map
        };
    },
    /**
     * Processes a configuration node by determining whether it is part of a sequence or map.
     *
     * @param node The configuration leaf node.
     * @param name The name of the configuration.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    processConfigurationNode: function (node, name) {
        if (name) {                                         // check if the name exists
            var keyPair = this.createKeyPair(name, node);   // create a KeyPair with the name and node as its value
            return this.createMapNode(keyPair);             // return a Map Node with the key pair as its value
        }
        return node;                                        // return the node
    },
    /**
     * Create a NULL type Node given its name and value.
     *
     * @param name The name of the null value.
     * @returns {spec.Node} A null ConfigurationState Node.
     */
    createNullNode: function (name) {
        var node = this.createNode(this.type.NULL_VALUE);   // create the NULL Node
        node.setNullValue(null);                            // set the value of the Node
        return this.processConfigurationNode(node, name);   // return the processed Node
    },
    /**
     * Create a STRING type Node given its name and value.
     *
     * @param name The name of the string.
     * @param value The value of the string.
     * @returns {spec.Node} A string ConfigurationState Node.
     */
    createStringNode: function (name, value) {
        var node = this.createNode(this.type.STRING);       // create the STRING Node
        node.setStringValue(value);                         // set the value of the Node
        return this.processConfigurationNode(node, name);   // return the processed Node
    },
    /**
     * Create a BOOLEAN type Node given its name and value.
     *
     * @param name The name of the boolean.
     * @param value The value of the boolean.
     * @returns {spec.Node} A boolean ConfigurationState Node.
     */
    createBooleanNode: function (name, value) {
        var node = this.createNode(this.type.BOOLEAN);      // create the BOOLEAN Node
        node.setBooleanValue(value);                        // set the value of the Node
        return this.processConfigurationNode(node, name);   // return the processed Node
    },
    /**
     * Create a LONG type Node given its name and value.
     *
     * @param name The name of the long.
     * @param value The value of the long.
     * @returns {spec.Node} A long ConfigurationState Node.
     */
    createLongNode: function (name, value) {
        var node = this.createNode(this.type.LONG);         // create the LONG Node
        node.setLongValue(value);                           // set the value of the Node
        return this.processConfigurationNode(node, name);   // return the processed Node
    },
    /**
     * Create a DOUBLE type Node given its name and value.
     *
     * @param name The name of the double.
     * @param value The value of the double.
     * @returns {spec.Node} A double ConfigurationState Node.
     */
    createDoubleNode: function (name, value) {
        var node = this.createNode(this.type.DOUBLE);       // create the DOUBLE Node
        node.setDoubleValue(value);                         // set the value of the Node
        return this.processConfigurationNode(node, name);   // return the processed Node
    },
    /**
     * Creates a SEQUENCE type Node and adds a Node to its sequence value.
     *
     * @param name The name of the sequence.
     * @returns {spec.Node} A sequence ConfigurationState Node.
     */
    createSequenceNode: function (name) {
        var node = this.createNode(this.type.SEQUENCE);     // create a SEQUENCE Node
        return this.processConfigurationNode(node, name);   // return the processed Node
    },
    /**
     * Creates a MAP type Node and adds a Node to its map value.
     *
     * @param value The Node that will be used as the map value.
     * @returns {spec.Node} A map ConfigurationState Node.
     */
    createMapNode: function (value) {
        var node = this.createNode(this.type.MAP);          // create the MAP Node
        node.setMapValue(value);                            // set the value of the Node
        return node;                                        // return the processed Node
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
