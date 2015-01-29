/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    requires: [
        'Ext.slider.Single'
    ],
    configurations: null,               // The view that contains the configurations
    type: null,                         // The protocol buffer enumeration
    currentTree: null,                  // The current configuration update tree
    Modes: {
        LIVE:     {name: 'Live'},       // Live updating
        STANDARD: {name: 'Standard'}    // Standard updating
    },
    mode: null,                         // The current updating mode
    init: function () {
        var view = this.getView();
        this.configurations = view.lookupReference('configurations');
        this.type = API.ConfigurationState.Node.Type;
        this.mode = this.Modes.STANDARD;
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
        // change the mode based on the state
        this.mode = state ? this.Modes.LIVE : this.Modes.STANDARD;
        // update the displays to match the current mode
        this.updateModeDisplay(this.mode);
    },
    /**
     * The event triggered when the user saves their configurations. It sends the message using the current tree.
     */
    onSave: function () {
        this.send(this.currentTree);
    },
    /**
     * Updates the current mode component based on the current mode.
     *
     * @param mode The current mode.
     */
    updateModeDisplay: function (mode) {
        // retrieve the configuration view
        var view = this.getView();
        // get the current mode component and save button
        var currentMode = view.lookupReference('currentMode');
        var save = view.lookupReference('save');
        // update the current mode and switch mode views
        this.updateMode(currentMode, mode);
        this.updateSaveDisplay(save);
        // update the flex of the current mode component and then update the view layout
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
            index: node.get('index'),
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
        Ext.each(map, function (item, i) {
            // processes the message and its map value
            this.processMessage(node.appendChild({
                name: item.name,
                path: item.path,
                type: type,
                index: i
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
        var path = record.get('path');                          // get the path from the record
        if (path) {                                             // check if the record contains a path
            // process the file path
            return this.processFilePath(currentTree, record, path);
        }
        // build the tree recursively using the parent node until the file is found
        var tree = this.buildTree(currentTree, record.parentNode, newValue);
        path = this.createRecordPath(tree.currentPath, record);
        var node;
        if (currentTree && (node = currentTree.mappings[path])) {
            tree.current = node;
            tree.currentPath = path;
        } else {
            node = this.processRecord(record);                  // create the proto node
            this.addTreeMappings(tree, record, node);           // add the relevant mappings to the tree
            this.processCurrent(tree, record, node);            // process the current node in the tree
        }
        if (!record.hasChildNodes()) {                          // check if at the widget node
            this.setNodeValue(tree.current, newValue);          // change the value to new configuration value
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
        var name = record.get('name');                          // get the name from the record
        if (name) {                                             // check if the name exists
            return this.createPath(currentPath, name);          // return the path by appending the name to the current path
        }
        // return the path by appending the index to the current path
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
        var newCurrent = node;                                  // set the new current value to the node
        var current = tree.current;                             // get the current node from the tree
        var type = current.type;                                // get the type of the current node in the tree
        if (type === this.type.MAP) {                           // check if the type of the current node is a map
            var maps = current.getMapValue();                   // get all the map values from the node
            var map = maps[0];                                  // get the first map from the current node in the tree
            if (map.getValue() === null) {                      // check if the value does not exist
                map.setValue(node);                             // set the value on the map
            } else {                                            // we're in the correct map
                if (node.type === this.type.MAP) {              // check if the node type is a map
                    maps.push(node.getMapValue()[0]);           // append the map value of the node to the current maps
                } else {
                    newCurrent = node.getSequenceValue()[0];    // set the new current value to the value
                }
            }
        } else if (type === this.type.SEQUENCE) {               // check if the type of the current node is a sequence
            var parent = record.parentNode;                     // get the parent node that contains the index
            node.setTag(parent.get('index').toString());        // set a tag on the new node indicating the index
            current.getSequenceValue().push(node);              // set the sequence value of the current tree
        } else {
            var value = current.getValue();                     // get the value of the KeyPair
            if (value) {                                        // check if a value exists
                if (value.type === this.type.MAP) {             // check if the value contains a map
                    // must be a map node too, append it
                    value.getMapValue().push(node.getMapValue()[0]);
                } else {
                    // get the sequence value
                    var sequence = node.getSequenceValue();
                    // append the sequence if there are already values inside it, otherwise set the current value to
                    // the old value
                    if (sequence.length > 0) {
                        value.getSequenceValue().push(node.getSequenceValue()[0]);
                    } else {
                        newCurrent = value;
                    }
                }
            } else {
                // set the value of the KeyPair
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
        var path;                                               // create a variable to store the path
        var name = record.get('name');                          // get the name of the record
        var index = record.get('index');                        // get the index of the record
        var currentPath = tree.currentPath;                     // get the current path from the tree
        if (tree.current.type !== this.type.SEQUENCE) {         // check if the type of the current tree is not a sequence
            path = this.createRecordPath(currentPath, record);  // set the current path of the tree using the record
            tree.mappings[path] = node;                         // add the node mapping using the current path
        } else {
            tree.mappings[currentPath] = node;                  // fix the sequence node mapping
        }
        if (name) {                                             // check if the name exists in the record
            path = this.createPath(currentPath, name);          // create the path using the name
            tree.mappings[path] = node.getMapValue()[0];        // add the mapping to the tree
        }
        if (path) {
            tree.currentPath = path;                            // set the current path to the path
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
        var fileNode = this.createFileNode(node);               // create the file node
        var root = fileNode.node;                               // default the root to the node within the object
        var current = fileNode.file;                            // default current to the map within the object
        var mappings = {};
        if (currentTree === null) {                             // check if the current tree does not exist
            mappings[path] = current;                           // add the file mapping for later
        } else {
            var file = currentTree.mappings[path];              // get the file from its mappings
            if (file) {                                         // check if the file exists
                current = file;                                 // override current to the existing file from the tree mappings
            } else {
                currentTree.root.getMapValue().push(current);   // add the file to the current tree as it does not exist in the tree mappings
            }
            // override the root and set the mappings to the original mappings from the current tree
            root = currentTree.root;
            mappings = currentTree.mappings;
        }
        // return an object containing the root, current node and path and existing mappings
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
        var keyPair = new API.Configuration.KeyPair;            // create the KeyPair
        keyPair.setName(name);                                  // set the name of the KeyPair
        if (value) {                                            // check if the value was passed in
            keyPair.setValue(value);                            // set the value of the KeyPair
        }
        if (path) {                                             // check if the path was passed in
            keyPair.setPath(path);                              // set the path of the keyPair if it exists
        }
        return keyPair;                                         // return the KeyPair that was created
    },
    /**
     * Creates a Node given a particular type.
     *
     * @param type The type of node to create.
     * @returns {spec.Node} A ConfigurationState Node.
     */
    createNode: function (type) {
        var node = new API.Configuration.Node;                  // create the Configuration Node
        node.setType(type);                                     // set its type
        return node;                                            // return the Node that was created
    },
    /**
     * Creates a FILE type Node given the record data.
     *
     * @param record The record to obtain data from.
     * @returns {{node: spec.Node, file: API.Configuration.KeyPair}} The file node and its map value.
     */
    createFileNode: function (record) {
        var node = this.createNode(this.type.FILE);             // create the FILE Node
        var map = new API.Configuration.KeyPair;                // create the map associated with the Node
        map.setName(record.get('name'));                        // set the name of the map to the file name
        map.setPath(record.get('path'));                        // set the path of the map to the configuration path
        node.getMapValue().push(map);                           // append the map to the Node
        return {                                                // return the Node and KeyPair
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
        return node;
    },
    /**
     * Create a NULL type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A null ConfigurationState Node.
     */
    createNullNode: function (record) {
        var node = this.createNode(this.type.NULL_VALUE);       // create the NULL Node
        return this.processConfigurationNode(node, record);     // return the processed Node
    },
    /**
     * Create a STRING type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A string ConfigurationState Node.
     */
    createStringNode: function (record) {
        var node = this.createNode(this.type.STRING);           // create the STRING Node
        return this.processConfigurationNode(node, record);     // return the processed Node
    },
    /**
     * Create a BOOLEAN type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A boolean ConfigurationState Node.
     */
    createBooleanNode: function (record) {
        var node = this.createNode(this.type.BOOLEAN);          // create the BOOLEAN Node
        return this.processConfigurationNode(node, record);     // return the processed Node
    },
    /**
     * Create a LONG type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A long ConfigurationState Node.
     */
    createLongNode: function (record) {
        var node = this.createNode(this.type.LONG);             // create the LONG Node
        return this.processConfigurationNode(node, record);     // return the processed Node
    },
    /**
     * Create a DOUBLE type Node given its name and value.
     *
     * @param record The record containing the node data.
     * @returns {spec.Node} A double ConfigurationState Node.
     */
    createDoubleNode: function (record) {
        var node = this.createNode(this.type.DOUBLE);           // create the DOUBLE Node
        return this.processConfigurationNode(node, record);     // return the processed Node
    },
    /**
     * Creates a SEQUENCE type Node and adds a Node to its sequence value.
     *
     * @param record The record containing the node data.
     * @param [value] An optional sequence value.
     * @returns {spec.Node} A sequence ConfigurationState Node.
     */
    createSequenceNode: function (record, value) {
        var node = this.createNode(this.type.SEQUENCE);         // create a SEQUENCE Node
        if (value) {                                            // check if the value exists
            node.getSequenceValue().push(value);                // set the value of the Node
        }
        return this.processConfigurationNode(node, record);     // return the processed Node
    },
    /**
     * Creates a MAP type Node and adds a Node to its map value.
     *
     * @param value The Node that will be used as the map value.
     * @returns {spec.Node} A map ConfigurationState Node.
     */
    createMapNode: function (value) {
        var node = this.createNode(this.type.MAP);              // create the MAP Node
        node.setMapValue(value);                                // set the value of the Node
        return node;                                            // return the processed Node
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
            case this.type.SEQUENCE:
                this.setNodeValue(node.getSequenceValue()[0], value);
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
            // create the configuration state message
            var message = NU.util.Network.createMessage(API.Message.Type.CONFIGURATION_STATE, 0);
            // set the configuration state of the message
            message.setConfigurationState(this.getConfigurationState(tree));
            // send the message over the network
            NU.util.Network.send(this.getRobotIP(), message);
        }
        // reset the current tree
        this.currentTree = null;
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
