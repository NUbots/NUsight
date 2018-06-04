/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    requires: [
        'Ext.slider.Single'
    ],
    type: null,                         // The protocol buffer enumeration.
    currentTree: null,                  // The current configuration update tree.
    Modes: {
        LIVE:     {name: 'Live'},       // Live updating.
        STANDARD: {name: 'Standard'}    // Standard updating.
    },
    mode: null,                         // The current updating mode.
    init: function () {
        this.store = this.getViewModel().getStore('tree');
        NU.Network.loadProto('message.support.nusight.ConfigurationState');
        this.type = API.message.support.nusight.ConfigurationState.Node.Type;
        this.mode = this.Modes.STANDARD;
        this.mon(NU.Network, 'message.support.nusight.ConfigurationState', this.onConfigurationState, this);
    },
    /**
     * A function that is called when the user selects a robot. It then sends the command to get the configuration state with this IP address.
     *
     * @param robotId The robot id selected by the user.
     */
    onSelectRobot: function (robotId) {
        this.setRobotId(robotId);
        this.sendCommand();
    },
    /**
     * An event fired when the network has received the configuration state message.
     *
     * @param robotId The robot id.
     * @param configurationState The configuration state protocol buffer.
     */
    onConfigurationState: function (robot, configurationState) {
        if (robot.get('id') !== this.getRobotId()) {
            return;
        }
        // Retrieve the root from the buffer.
        var root = configurationState.getRoot();
        // Processes the message in the view model using the store's root as the initial node.
        this.getViewModel().processMessage(this.store.getRoot(), root);
    },
    /**
     * Sends a command to the network requesting the configuration state.
     */
    sendCommand: function () {
        NU.Network.sendCommand('get_configuration_state', this.getRobotId());
    },
    /**
     * An event triggered when the current mode display has rendered.
     *
     * @param view The current mode display.
     */
    onCurrentModeAfterRender: function (view) {
        this.updateMode(view, this.mode);
    },
    /**
     * An event triggered when the save button has been rendered. It simply determines whether the button should be
     * visible on startup.
     *
     * @param view The save button.
     */
    onSaveAfterRender: function (view) {
        this.updateSaveDisplay(view);
    },
    /**
     * An event triggered when the live toggle button has been rendered. It determines whether the button should begin
     * as pressed or not.
     *
     * @param view The live toggle button.
     */
    onLiveAfterRender: function (view) {
        view.setPressed(this.mode === this.Modes.LIVE);
    },
    /**
     * The toggle handler for the button that toggles the current mode. It also updates the mode display.
     *
     * @param button The button being toggled.
     * @param state The current state of the toggle
     */
    onToggleMode: function (button, state) {
        // Change the mode based on the state and update the displays to match the current mode.
        this.mode = state ? this.Modes.LIVE : this.Modes.STANDARD;
        this.updateModeDisplay(this.mode);
    },
    /**
     * The event triggered when the user saves their configurations. It sends the message using the current tree.
     */
    onSave: function () {
        this.send(this.currentTree);
    },
    /**
     * The event triggered when the user refreshes the treepanel. It reloads the store and sends the command requesting
     * the store data again.
     */
    onRefresh: function () {
        // Reload the store and resend the command.
        this.store.reload();
        this.sendCommand();
    },
    /**
     * An event triggered when the user closed the window. The store is reloaded to prevent duplication of data
     * when reopened.
     */
    onClose: function () {
        this.store.reload();
    },
    /**
     * Updates the current mode component based on the current mode.
     *
     * @param mode The current mode.
     */
    updateModeDisplay: function (mode) {
        // Retrieve the configuration view.
        var view = this.getView();
        // Get the current mode component and save button.
        var currentMode = view.lookupReference('currentMode');
        var save = view.lookupReference('save');
        // Update the current mode and switch mode views.
        this.updateMode(currentMode, mode);
        this.updateSaveDisplay(save);
        // Update the flex of the current mode component and then update the view layout.
        currentMode.flex += save.isHidden() ? save.flex : -save.flex;
        view.updateLayout();
    },
    /**
     * Updates the mode display based on the mode that is passed in.
     *
     * @param view The view being updated.
     * @param mode The mode that is in context.
     */
    updateMode: function (view, mode) {
        var name = mode.name;
        view.update({
            name: name
        });
    },
    /**
     * Toggles the visibility of the save button based on the current mode.
     *
     * @param view The save button view.
     */
    updateSaveDisplay: function (view) {
        view.setVisible(this.mode === this.Modes.STANDARD);
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
        // Get the value of the record and its type.
        var value = this.getRecordValue(record);
        var type = record.get('type');
        // Check if we should even update the configuration file first.
        if (value !== newValue) {
            // Build the tree using the initial record and its new value.
            var tree = this.buildTree(this.currentTree, record, newValue);
            // Check if the tree should be sent or updated.
            if (this.mode === this.Modes.LIVE) {
                this.send(tree);
            } else {
                this.currentTree = tree;
            }
        }
    },
    /**
     * Recursively builds the Configuration State message. It keeps on going up the tree until a file is found (i.e. a
     * path exists) and then determines if the node that corresponds to the record has been created before or not. It
     * determines this by retrieving the path to the record and checking if the node exists in the current tree's
     * mappings. When this is the case, the current node and path need to be altered. Otherwise, a node needs to be
     * created and appended to the current node of the tree. Additional tree mappings are then added to the tree and
     * the current node is set to the node that was just created.
     *
     * @param currentTree The current configuration update tree.
     * @param record The current record being processed.
     * @param newValue The new value for the configuration.
     * @returns {*} The ConfigurationState message tree.
     */
    buildTree: function (currentTree, record, newValue) {
        // Retrieve the path from the record and process it if it exists.
        var path = record.get('path');
        if (path) {
            return this.processFilePath(currentTree, record, path);
        }
        // Build the tree recursively using the parent node until the file is found.
        var tree = this.buildTree(currentTree, record.parentNode, newValue);
        path = this.createRecordPath(tree.currentPath, record);
        var node;
        if (currentTree && (node = currentTree.mappings[path])) {
            tree.current = node;
            tree.currentPath = path;
        } else {
            // Create the protocol node, add the relevant tree mappings and process the current node in the tree.
            node = this.processRecord(record);
            this.addTreeMappings(tree, record, node);
            this.processCurrent(tree, record, node);
        }
        // Check if the the record does not have any more children which indicates that we are at the widget node.
        if (!record.hasChildNodes()) {
            // Change the value to the new configuration value.
            this.setNodeValue(tree.current, newValue);
        }
        return tree;
    },
    /**
     * Creates a path to be used for the tree mappings based on whether the record data contains a name or index.
     *
     * @param currentPath The current path.
     * @param record The record being evaluated.
     * @returns {*} The path to the record within the tree mappings.
     */
    createRecordPath: function (currentPath, record) {
        var name = record.get('name');
        if (name) {
            // Return the path by appending the name to the current path.
            return this.createPath(currentPath, name);
        }
        // Return the path by appending the index to the current path.
        return this.createPath(currentPath, record.get('index'));
    },
    /**
     * Creates a path to be used for the tree mappings by appending some string to the current path.
     *
     * @param currentPath The current path within the tree.
     * @param toAppend The string to append to the current path.
     * @returns {*}
     */
    createPath: function (currentPath, toAppend) {
        return Ext.String.format('{0}/{1}', currentPath, toAppend);
    },
    /**
     * Processes the current node within the tree so that the node that was created is appended. The type of the
     * current node is first evaluated. There are three possibilities:
     *
     *      1. The current type is a MAP Node. When the Node does not have a value, the value can be set to the node.
     *         Otherwise, the type of the node needs to be evaluated.
     *      2. The current type is a SEQUENCE Node. This means that the node needs to be appended to the sequence and
     *         its tag is set to the index of the parent node so it can later be accessed on the server for easy
     *         reference.
     *      3. The current node is a KeyPair and either its value needs to be set to the node or a value already exists
     *         and the value then needs to be processed.
     *
     * @param tree The tree that contains the current node within the tree.
     * @param record The current record being processed.
     * @param node The node that was created.
     */
    processCurrent: function (tree, record, node) {
        // Set the new current value to the node.
        var newCurrent = node;
        // Get the current node from the tree and its type
        var current = tree.current;
        var type = current.type;
        // Check if the type of the current node is a map.
        if (type === this.type.MAP) {
            // Get all the map values from the node and its first value.
            var maps = current.getMapValue();
            var map = maps[0];
            // Check if the map value does not exist and then set its value to the node.
            if (map.getValue() === null) {
                map.setValue(node);
            } else {
                // Check if the node type is a map.
                if (node.type === this.type.MAP) {
                    // Append the map value of the node to the current maps.
                    maps.push(node.getMapValue()[0]);
                } else {
                    // Set the new current value to the first sequence value.
                    newCurrent = node.getSequenceValue()[0];
                }
            }
        // Check if the type of the current node is a sequence.
        } else if (type === this.type.SEQUENCE) {
            // Get the parent node that contains the index.
            var parent = record.parentNode;
            // Set a tag on the new node indicating the index.
            node.setTag(parent.get('index').toString());
            // Set the sequence value of the current tree.
            current.getSequenceValue().push(node);
        } else {
            // Get the value of the KeyPair.
            var value = current.getValue();
            // Check if a value exists from the KeyPair.
            if (value) {
                // Check if the value contains a map node.
                if (value.type === this.type.MAP) {
                    // Must be a map node too, append it.
                    value.getMapValue().push(node.getMapValue()[0]);
                } else {
                    // Get the sequence value.
                    var sequence = node.getSequenceValue();
                    // Append the sequence if there are already values inside it, otherwise set the current value to
                    // the old value.
                    if (sequence.length > 0) {
                        value.getSequenceValue().push(node.getSequenceValue()[0]);
                    } else {
                        newCurrent = value;
                    }
                }
            } else {
                // Set the value of the KeyPair.
                current.setValue(node);
            }
        }
        tree.current = newCurrent;
    },
    /**
     * Creates a map between the record path to the ConfigurationState Node so it can be accessed later when updating
     * the tree if not in live mode.
     *
     * @param tree The tree that was built.
     * @param record The current record being processed.
     * @param node The node that was created.
     */
    addTreeMappings: function (tree, record, node) {
        var path;
        // Retrieve the name and index of the record.
        var name = record.get('name');
        var index = record.get('index');
        // Retrieve the current path from the tree.
        var currentPath = tree.currentPath;
        // If the current type of the tree is not a sequence node, the node can be added to the tree mappings using
        // the record path as its key.
        if (tree.current.type !== this.type.SEQUENCE) {
            path = this.createRecordPath(currentPath, record);
            tree.mappings[path] = node;
        } else {
            // Fix the sequence node mapping.
            tree.mappings[currentPath] = node;
        }
        // If the name exists in the record, then a path can be created based off the name so it can be used with the
        // tree mappings.
        if (name) {
            path = this.createPath(currentPath, name);
            tree.mappings[path] = node.getMapValue()[0];
        }
        // If the path was set in this method, then the current path of the tree is set.
        if (path) {
            tree.currentPath = path;
        }
    },
    /**
     * Processes a file node when the tree is being built.
     *
     * @param currentTree The current configuration update tree.
     * @param node The file node being processed.
     * @param path The path to the file.
     * @returns {{root: (spec.Node|*), current: (API.Configuration.KeyPair|*), currentPath: *, mappings: {}}}
     */
    processFilePath: function (currentTree, node, path) {
        // Create the file node.
        var fileNode = this.createFileNode(node);
        // Default the root to the node within the object.
        var root = fileNode.node;
        // Default current to the map within the object.
        var current = fileNode.file;
        // An object to store tree mappings.
        var mappings = {};
        // Check if the current tree does not exist and add the file mapping that is to be used later.
        if (currentTree === null) {
            mappings[path] = current;
        } else {
            // Get the file from the tree mappings and override current to the existing file if the mapping exists.
            var file = currentTree.mappings[path];
            if (file) {
                current = file;
            } else {
                // Add the file to the current tree as it does not exist in the tree mappings.
                currentTree.root.getMapValue().push(current);
            }
            // Override the root and set the mappings to the original mappings from the current tree.
            root = currentTree.root;
            mappings = currentTree.mappings;
        }
        // Return an object containing the root, current node and path and existing mappings.
        return {
            root: root,
            current: current,
            currentPath: path,
            mappings: mappings
        }
    },
    /**
     * Retrieves the data from the record that is being processed, then evaluates its type to build a protocol buffer
     * message Node.
     *
     * @param record The record being processed.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    processRecord: function (record) {
        // evaluate the type of the record
        switch (record.get('type')) {
            case this.type.MAP:
                return this.createMapNode(this.createKeyPair(record.get('name')));
            case this.type.LONG:
                return this.createLongNode(record);
            case this.type.DOUBLE:
                return this.createDoubleNode(record);
            case this.type.BOOLEAN:
                return this.createBooleanNode(record);
            case this.type.STRING:
                return this.createStringNode(record);
            case this.type.SEQUENCE:
                return this.createSequenceNode(record);
            case this.type.NULL_VALUE:
                return this.createNullNode(record);
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
        var keyPair = new API.message.support.nusight.ConfigurationState.KeyPair;
        keyPair.setName(name);
        if (value) {
            keyPair.setValue(value);
        }
        if (path) {
            keyPair.setPath(path);
        }
        return keyPair;
    },
    /**
     * Creates a Node given a particular type.
     *
     * @param type The type of node to create.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    createNode: function (type) {
        var node = new API.message.support.nusight.ConfigurationState.Node;
        node.setType(type);
        return node;
    },
    /**
     * Creates a FILE type Node given the record data.
     *
     * @param record The record to obtain data from.
     * @returns {{node: spec.Node, file: API.Configuration.KeyPair}} The file node and its map value.
     */
    createFileNode: function (record) {
        var node = this.createNode(this.type.FILE);
        var map = new API.message.support.nusight.ConfigurationState.KeyPair;
        map.setName(record.get('name'));
        map.setPath(record.get('path'));
        node.getMapValue().push(map);
        return {
            node: node,
            file: map
        };
    },
    /**
     * Processes a configuration node by determining whether it is part of a sequence or map and processes them
     * accordingly.
     *
     * @param node The configuration leaf node.
     * @param record The record containing the node data.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    processConfigurationNode: function (node, record) {
        if (record) {
            var name = record.get('name');
            if (name) {
                var keyPair = this.createKeyPair(name, node);
                return this.createMapNode(keyPair);
            } else if (node.getType() !== this.type.SEQUENCE) {
                node.setTag(record.get('index').toString());
                return this.createSequenceNode(record, node);
            }
        }
        return node;
    },
    /**
     * Create a NULL type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A null ConfigurationState Node.
     */
    createNullNode: function (record) {
        var node = this.createNode(this.type.NULL_VALUE);
        return this.processConfigurationNode(node, record);
    },
    /**
     * Create a STRING type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A string ConfigurationState Node.
     */
    createStringNode: function (record) {
        var node = this.createNode(this.type.STRING);
        return this.processConfigurationNode(node, record);
    },
    /**
     * Create a BOOLEAN type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A boolean ConfigurationState Node.
     */
    createBooleanNode: function (record) {
        var node = this.createNode(this.type.BOOLEAN);
        return this.processConfigurationNode(node, record);
    },
    /**
     * Create a LONG type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A long ConfigurationState Node.
     */
    createLongNode: function (record) {
        var node = this.createNode(this.type.LONG);
        return this.processConfigurationNode(node, record);
    },
    /**
     * Create a DOUBLE type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A double ConfigurationState Node.
     */
    createDoubleNode: function (record) {
        var node = this.createNode(this.type.DOUBLE);
        return this.processConfigurationNode(node, record);
    },
    /**
     * Creates a SEQUENCE type Node and adds a Node to its sequence value.
     *
     * @param record The record containing the node data.
     * @param [value] An optional sequence value.
     * @returns {spec.Node} A sequence ConfigurationState Node.
     */
    createSequenceNode: function (record, value) {
        var node = this.createNode(this.type.SEQUENCE);
        if (value) {
            node.getSequenceValue().push(value);
        }
        return this.processConfigurationNode(node, record);
    },
    /**
     * Creates a MAP type Node and adds a Node to its map value.
     *
     * @param value The Node that will be used as the map value.
     * @returns {spec.Node} A map ConfigurationState Node.
     */
    createMapNode: function (value) {
        var node = this.createNode(this.type.MAP);
        node.setMapValue(value);
        return node;
    },
    /**
     * Sets a node's value by evaluating its type.
     *
     * @param node The node having the value set.
     * @param value The value to set for the node.
     */
    setNodeValue: function (node, value) {
        switch (node.type) {
            case this.type.MAP:
                this.setNodeValue(node.getMapValue()[0].getValue(), value);
                break;
            case this.type.SEQUENCE:
                this.setNodeValue(node.getSequenceValue()[0], value);
                break;
            case this.type.LONG:
                node.setLongValue(value);
                break;
            case this.type.DOUBLE:
                node.setDoubleValue(value);
                break;
            case this.type.BOOLEAN:
                node.setBooleanValue(value);
                break;
            case this.type.STRING:
                node.setStringValue(value);
                break;
            case this.type.NULL_VALUE:
                node.setNullValue(value);
                break;
        }
    },
    /**
     * Sends the ConfigurationState message over the network by creating one.
     *
     * @param tree The tree that contains the information to send over the network.
     */
    send: function (tree) {
        if (tree !== null) {
            // Send the message over the network.
            NU.Network.send(this.getConfigurationState(tree), this.getRobotId(), true);
        }
        // Reset the current tree.
        this.currentTree = null;
    },
    /**
     * Retrieves the ConfigurationState message by using the tree.
     *
     * @param tree The configuration tree.
     * @returns {Window.API.Configuration} The ConfigurationState message.
     */
    getConfigurationState: function (tree) {
        var configuration = new API.message.support.nusight.ConfigurationState();
        configuration.setRoot(tree.root);
        return configuration;
    }
    //,
    ///**
    // * Removes a configuration for a particular robot.
    // *
    // * @param configuration The widget associated with a configuration to remove.
    // */
    //removeConfiguration: function (configuration) {
    //    configuration = this.transformReference(configuration);
    //    this.configurations.remove(this.configurations.lookupReference(configuration));
    //}
    // TODO: vectors
});
