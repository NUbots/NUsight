/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    configurations: null,               // The view that contains the configurations
    type: null,                         // The protocol buffer enumeration
    currentTree: null,                  // The current configuration update tree
    Modes: {
        LIVE:     {name: 'Live'},       // Live updating
        STANDARD: {name: 'Standard'}    // Standard updating
    },
    mode: null,                         // The current updating mode
    requires: [
        'Ext.slider.Single'
    ],
    init: function () {
        var view = this.getView();
        this.configurations = view.lookupReference('configurations');
        this.type = API.ConfigurationState.Node.Type;
        this.mode = this.Modes.LIVE;
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
     * An event triggered when the current mode display has rendered.
     *
     * @param view The current mode display.
     */
    onCurrentModeAfterRender: function (view) {
        this.updateMode(view, this.mode);
    },
    onSaveAfterRender: function (view) {
        this.updateSaveDisplay(view);
    },
    /**
     * An event triggered when the switch mode display has rendered.
     *
     * @param view The switch mode display.
     */
    onSwitchModeAfterRender: function (view) {
        // add a click event to the component
        view.getEl().on({
            click: 'onSwitchMode'
        });
        // update the display
        this.updateMode(view, this.getSwitchMode());
    },
    /**
     * The handler for the button that switches the current mode. It also updates the mode display.
     */
    onSwitchMode: function () {
        // check the mode and toggle it
        if (this.mode === this.Modes.LIVE) {
            this.mode = this.Modes.STANDARD;
        } else {
            this.mode = this.Modes.LIVE;
        }
        // update the displays to match the current mode
        this.updateModeDisplay(this.mode);
    },
    onSave: function () {
        debugger;
    },
    /**
     * Updates the current mode component and switch button displays based on the current mode.
     *
     * @param mode The current mode.
     */
    updateModeDisplay: function (mode) {
        // retrieve the configuration view
        var view = this.getView();
        // update the current mode and switch mode views
        this.updateMode(view.lookupReference('currentMode'), mode);
        this.updateMode(view.lookupReference('switchMode'), this.getSwitchMode());
        this.updateSaveDisplay(view.lookupReference('save'));
    },
    /**
     * Calculates and returns the updating mode that can be switched to.
     *
     * @returns {*} The switching mode.
     */
    getSwitchMode: function () {
        if (this.mode === this.Modes.LIVE) {
            return this.Modes.STANDARD;
        }
        return this.Modes.LIVE;
    },
    /**
     * Updates the mode display based on the mode that is passed in.
     *
     * @param view The view being updated.
     * @param mode The mode that is in context.
     */
    updateMode: function (view, mode) {
        var name = mode.name;
        // TODO: ExtJS doesn't support button tpl hack
        if (view.isXType('button')) {
            view.setText(new Ext.XTemplate(view.tpl).apply({
                name: name
            }));
        } else {
            view.update({
                name: name
            });
        }
    },
    /**
     * Shows or hides the save button based on the current mode.
     *
     * @param view The save button view.
     */
    updateSaveDisplay: function (view) {
        if (this.mode === this.Modes.LIVE) {
            view.hide();
        } else {
            view.show();
        }
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
        // iterates through every sequence message
        Ext.each(sequence, function (item, i) {
            // processes the sequence message
            this.processMessage(node.appendChild({
                type: type,
                index: i
            }), item);
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
    /**
     * Retrieves the proper record value if the widget is of a special type.
     *
     * @param record The record that contains the value.
     * @returns {*} The value of the record.
     */
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
            // build the tree using the initial record and its new value
            var tree = this.buildTree(this.currentTree, record, newValue);
            debugger;
            if (this.mode === this.Modes.LIVE) {
                // create the configuration state message
                var message = NU.util.Network.createMessage(API.Message.Type.CONFIGURATION_STATE, 0);
                // set the configuration state of the message
                message.setConfigurationState(this.getConfigurationState(tree));
                // send the message over the network
                NU.util.Network.send(this.getRobotIP(), message);
                // reset the current tree
                this.currentTree = null;
            } else {
                this.currentTree = tree;
            }
        }
    },
    /**
     * Retrieves the ConfigurationState message by using the tree.
     *
     * @param tree The configuration tree.
     * @returns {Window.API.Configuration} The ConfigurationState message.
     */
    getConfigurationState: function (tree) {
        var configuration = new API.Configuration();        // create the configuration API
        configuration.setRoot(tree.root);                   // set the root of the configuration message
        return configuration;                               // return the configuration message
    },
    /**
     * Recursively builds the Configuration State message. It keeps on going up the tree until a file is found (i.e. a
     * path exists) and then creates a node using the current data and appends it to the current value of the tree.
     *
     * @param currentTree The current configuration update tree.
     * @param node The current node being processed.
     * @param newValue The new value for the configuration.
     * @returns {*} The ConfigurationState message tree.
     */
    buildTree: function (currentTree, node, newValue) {
        var path = node.get('path');                        // get the path from the node
        if (path) {                                         // check if the node contains a path
            // process the file path
            return this.processFilePath(currentTree, node, path);
        }
        // build the tree recursively using the parent node until the file is found
        var tree = this.buildTree(currentTree, node.parentNode, newValue);
        // create the proto node
        var newNode = this.processNode(node, newValue);
        var current = tree.current;                         // get the current node in the tree
        var type = current.type;                            // get the type of the current node in the tree
        if (type === this.type.MAP) {                       // check if the type of the current node is a map
            var map = current.getMapValue()[0];             // get the first map from the current node in the tree
            map.setValue(newNode);                          // set the value on the map
        } else if (type === this.type.SEQUENCE) {           // check if the type of the current node is a sequence
            var parent = node.parentNode;                   // get the parent of the node
            var index = parent.get('index').toString();     // get the index of the sequence item
            newNode.setTag(index);                          // set a tag on the new node indicating the index
            current.setSequenceValue(newNode);              // set the sequence value of the current tree
        } else {
            current.setValue(newNode);                      // append the new node as a KeyPair value
        }
        // set the new current node in the tree to the node that was created and return the tree
        tree.current = newNode;
        return tree;
    },
    /**
     * Processes a file node when the tree is being built.
     *
     * @param currentTree The current configuration update tree.
     * @param node The file node being processed.
     * @param path The path to the file.
     * @returns {{root: (spec.Node|*), current: (API.Configuration.KeyPair|*), mappings: {}}}
     */
    processFilePath: function (currentTree, node, path) {
        var fileNode = this.createFileNode(node);           // create the file node
        var root = fileNode.node;                           // create the root
        var current = fileNode.file;                        // create the current
        var mappings = {};
        if (currentTree === null) {                         // check if the current tree does not exist
            mappings[path] = current;                       // add the file mapping for later
        } else {
            var file = currentTree.mappings[path];          // get the file from its mappings
            if (file) {                                     // check if the file exists in the current tree
                current = file;                             // make the file the current value
            } else {
                // add the file to the current tree
                currentTree.root.getMapValue().push(current);
            }
            // override the root
            root = currentTree.root;
        }
        // return an object containing the root and the file as the current value
        return {
            root: root,
            current: current,
            mappings: mappings
        }
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
        var value = node.get('value');                      // get the value of the record
        if (!node.hasChildNodes()) {                        // check if at the widget node
            value = newValue;                               // change the value to new configuration value
        }
        switch (node.get('type')) {                         // evaluate the type of the record
            case this.type.MAP:
                return this.createMapNode(this.createKeyPair(node.get('name')));
            case this.type.LONG:
                return this.createLongNode(node, value);
            case this.type.DOUBLE:
                return this.createDoubleNode(node, value);
            case this.type.BOOLEAN:
                return this.createBooleanNode(node, value);
            case this.type.STRING:
                return this.createStringNode(node, value);
            case this.type.SEQUENCE:
                return this.createSequenceNode(node);
            case this.type.NULL_VALUE:
                return this.createNullNode(node);
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
     * @param record The record containing the node data.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    processConfigurationNode: function (node, record) {
        if (record) {                                           // check if the record exists
            var name = record.get('name');                      // get the name of the node
            if (name) {                                         // check if the name exists
                var keyPair = this.createKeyPair(name, node);   // create a KeyPair with the name and node as its value
                return this.createMapNode(keyPair);             // return a Map Node with the key pair as its value
            } else if (node.getType() !== this.type.SEQUENCE) { // check if the type is not a sequence
                node.setTag(record.get('index').toString());    // set the tag to the index of the node
                return this.createSequenceNode(record, node);   // create a sequence node as it is missing from the tree
            }
        }
        return node;                                            // return the node
    },
    /**
     * Create a NULL type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A null ConfigurationState Node.
     */
    createNullNode: function (record) {
        var node = this.createNode(this.type.NULL_VALUE);   // create the NULL Node
        node.setNullValue(null);                            // set the value of the Node
        return this.processConfigurationNode(node, record); // return the processed Node
    },
    /**
     * Create a STRING type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @param value The value of the string.
     * @returns {spec.Node} A string ConfigurationState Node.
     */
    createStringNode: function (record, value) {
        var node = this.createNode(this.type.STRING);       // create the STRING Node
        node.setStringValue(value);                         // set the value of the Node
        return this.processConfigurationNode(node, record); // return the processed Node
    },
    /**
     * Create a BOOLEAN type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @param value The value of the boolean.
     * @returns {spec.Node} A boolean ConfigurationState Node.
     */
    createBooleanNode: function (record, value) {
        var node = this.createNode(this.type.BOOLEAN);      // create the BOOLEAN Node
        node.setBooleanValue(value);                        // set the value of the Node
        return this.processConfigurationNode(node, record); // return the processed Node
    },
    /**
     * Create a LONG type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @param value The value of the long.
     * @returns {spec.Node} A long ConfigurationState Node.
     */
    createLongNode: function (record, value) {
        var node = this.createNode(this.type.LONG);         // create the LONG Node
        node.setLongValue(value);                           // set the value of the Node
        return this.processConfigurationNode(node, record); // return the processed Node
    },
    /**
     * Create a DOUBLE type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @param value The value of the double.
     * @returns {spec.Node} A double ConfigurationState Node.
     */
    createDoubleNode: function (record, value) {
        var node = this.createNode(this.type.DOUBLE);       // create the DOUBLE Node
        node.setDoubleValue(value);                         // set the value of the Node
        return this.processConfigurationNode(node, record); // return the processed Node
    },
    /**
     * Creates a SEQUENCE type Node and adds a Node to its sequence value.
     *
     * @param record The record containing the node data.
     * @param [value] An optional sequence value.
     * @returns {spec.Node} A sequence ConfigurationState Node.
     */
    createSequenceNode: function (record, value) {
        var node = this.createNode(this.type.SEQUENCE);     // create a SEQUENCE Node
        if (value) {                                        // check if the value exists
            node.setSequenceValue(value);                   // set the value of the Node
        }
        return this.processConfigurationNode(node, record); // return the processed Node
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
