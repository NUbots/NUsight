/**
 * @author: Monica Olejniczak, Josephus Paye II
 */
Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    requires: [
        'NU.util.Helper',
        'NU.util.Configuration',
        'Ext.form.Panel',
        'Ext.tree.Panel'
    ],

    init: function () {
        NU.Network.loadProto('message.support.nubugger.Command');
        NU.Network.loadProto('message.support.nubugger.Configuration');

        this.mon(NU.Network, 'message.support.nubugger.Configuration', this.onConfiguration, this);

        // Holds component references to the files (sidebar) and edit (content) panels
        this.refs = {
            filesPanel: this.lookupReference('filesPanel'),
            editPanel: this.lookupReference('editPanel')
        };

        // The nested list of config files
        this.fileTree = {};

        // The nested list of config files, formatted for display with the Ext TreePanel component
        this.extFileTree = [];
    },

    /**
     * A function that is called when the user selects a robot. It then sends the command
     * to get the configuration state with this IP address.
     *
     * @param robotId The robot id selected by the user.
     */
    onSelectRobot: function (robotId) {
        this.setRobotId(robotId);
        this.requestConfiguration();
    },

    /**
     * Sends a command to the network requesting the configuration state.
     */
    requestConfiguration: function () {
        NU.Network.sendNusightCommand('GET_CONFIGURATION', 'ConfigurationSimulator');
    },

    /**
     * Process and render the list of configuration files when a configuration
     * message is received from a robot.
     */
    onConfiguration(source, message) {
        this.fileTree = this.createFileTree(message.files);
        this.extFileTree = this.createExtFileTree(this.fileTree['config/']);

        console.log('File tree', this.fileTree);
        console.log('Ext file tree', this.extFileTree);

        this.renderFileTree(this.extFileTree);
    },

    /**
     * Convert the flat list of config files to a hierarchical tree-like structure
     *
     * @param  {Array} fileList    The flat list of config files
     * @return {Object}
     */
    createFileTree(fileList) {
        var files = fileList.map(function (file) {
            return this.createFileNode(file.path.split('/'), file.content, file.path);
        }.bind(this));

        var tree = {};

        files.forEach(function (file) {
            NU.util.Helper.deepMerge(tree, file);
        });

        return tree;
    },

    /**
     * Convert the given file tree to the Ext TreePanel component format for rendering
     *
     * @param  {Object} fileTree    The file tree to convert
     * @return {Array}
     */
    createExtFileTree(fileTree) {
        var tree = [];

        for (var file in fileTree) {
            if (file.trim().endsWith('/')) {
                tree.push({
                    text: file,
                    leaf: false,
                    data: fileTree[file],
                    children: this.createExtFileTree(fileTree[file])
                });
            } else {
                tree.push(fileTree[file]);
            }
        }

        return tree;
    },

    /**
     * Create a file node in the file tree
     *
     * @param  {Array} pathSegments  The path segments to the file node
     * @param  {Object} data         The file node's data
     * @param  {String} path         The full string path to the file node
     * @return {Object}
     */
    createFileNode(pathSegments, data, path) {
        var node = {};
        var firstSegment = pathSegments[0];

        if (pathSegments.length === 1) {
            node[firstSegment] = {
                text: firstSegment,
                leaf: true,
                data: {
                    content: NU.util.Configuration.decodeField(data),
                    path: path
                }
            };
        } else {
            node[firstSegment + '/'] = this.createFileNode(pathSegments.slice(1), data, path);
        }

        return node;
    },

    /**
     * Render the file tree using an Ext TreePanel
     *
     * @param  {Array} fileTree     The Ext-compatible file tree to render
     */
    renderFileTree(fileTree) {
        this.refs.filesPanel.removeAll();
        this.refs.filesPanel.add(
            Ext.create('Ext.tree.Panel', {
                title: 'Files',
                width: '100%',
                height: '100%',
                root: {
                    text: 'config/',
                    expanded: true,
                    children: fileTree
                },
                listeners:{
                    itemclick: function(node, record, el, index) {
                        this.renderFile(record);
                    }.bind(this)
                }
            })
        );
    },

    /**
     * Render the contents of the given file node as editable input fields
     *
     * @param  {Object} node    The file node from the files tree
     */
    renderFile(node) {
        if (node.data.text.endsWith('/')) {
            return;
        }

        var file = node.data.data;
        var fields = file.content.value;
        var inputs = [];

        for (field in fields) {
            inputs = inputs.concat(this.fieldToInput(fields[field], file.path + '@' + field))
        }

        this.refs.editPanel.removeAll();
        this.refs.editPanel.add(
            Ext.create('Ext.form.Panel', {
                title: file.path,
                width: '100%',
                height: '100%',
                bodyPadding: '16px',
                items: inputs
            })
        );
    },

    /**
     * Convert a field from the configuration message to an input field
     *
     * @param  {Object} field   The field object
     * @param  {String} path    The full path to the field in the file.
     *                          Example: config/darwin3/Network.yaml@port
     * @return {Array}
     */
    fieldToInput(field, path) {
        if (typeof field.value === 'boolean') {
            return this.createExtInput('checkbox', field, path);
        } else if (typeof field.value === 'number') {
            return this.createExtInput('numberfield', field, path);
        } else if (typeof field.value === 'string') {
            return this.createExtInput('textfield', field, path);
        } else if (NU.util.Helper.isObject(field.value)) {
            return Object.keys(field.value).map(function (subfield) {
                return this.fieldToInput(field.value[subfield], path + '.' + subfield);
            }.bind(this));
        }

        return []; // 'LOL';
    },

    /**
     * Create an Ext input field of the given type and data
     *
     * @param  {String} type    The xtype of the input field
     * @param  {Object} data    Data to associate with the field, later used for submitting changes
     * @param  {String} path    The full path to the field in the file.
     *                          Example: config/darwin3/Network.yaml@port
     * @return {Object}
     */
    createExtInput(type, data, path) {
        return {
            meta: {
                data: data,
                path: path
            },
            xtype: type,
            value: data.value,
            fieldLabel: path.split('@')[1],
            listeners: {
                scope: this,
                change: this.onInputChange
            }
        };
    },

   /**
    * Handle the change of an input field
    *
    * @param  {Object} field            The ExtJS input field instance
    * @param  {Number|String} newValue  The field's new value
    * @param  {Number|String} oldValue  The field's old value
    */
    onInputChange(field, newValue, oldValue) {
        if (newValue == oldValue) {
            return;
        }

        var path = this.parsePath(field.meta.path);

        var config = {
            file: path.toFile,
            path: path.toValue,
            value: NU.util.Helper.deepMerge(field.meta.data, { value: newValue })
        };

        // TODO: Encode config and send ConfigurationDelta message
    },

    /**
     * Parse the full path of a configuration value into an object containing
     * the file path and the path to the value in the file
     *
     * @param  {String} path The path to parse
     * @return {Object}
     */
    parsePath(path) {
        var segments = path.split('@');

        return {
            toFile: segments[0],
            toValue: segments[1].split('.')
        };
    }
});
