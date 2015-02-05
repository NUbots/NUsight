Ext.define('NU.view.window.ConfigurationViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.Configuration',
    requires: [
        'NU.store.ConfigurationTree'
    ],
    stores: {
        store: Ext.create('NU.store.ConfigurationTree')
    },
    /**
     * Processes a message node based on its message type.
     *
     * @param node The node to append children to.
     * @param message The message node being processed.
     */
    processMessage: function (node, message) {
        // get the type of nodes
        var nodeType = API.ConfigurationState.Node.Type;
        // retrieve the type and tag of the message
        var type = message.type;
        var tag = this.parseTag(message.tag);
        // evaluate the message type
        switch ((tag && tag.name) || type) {
            case nodeType.DIRECTORY:
            case nodeType.FILE:
            case nodeType.MAP:
                this.processMap(node, type, message.map_value);
                break;
            case nodeType.LONG:
                this.processLeafNode(node, type, 'NUMBER', message.long_value);
                break;
            case nodeType.DOUBLE:
                this.processLeafNode(node, type, 'NUMBER', message.double_value);
                break;
            case nodeType.BOOLEAN:
                this.processLeafNode(node, type, 'BOOLEAN', message.boolean_value);
                break;
            case nodeType.STRING:
                this.processLeafNode(node, type, 'TEXT', message.string_value);
                break;
            case nodeType.SEQUENCE:
                this.processSequence(node, type, message.sequence_value);
                break;
            case nodeType.NULL_VALUE:
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
    }
});