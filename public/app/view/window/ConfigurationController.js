/**
 * @author: Monica Olejniczak, Josephus Paye II
 */
Ext.define('NU.view.window.ConfigurationController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Configuration',
    requires: [
        'NU.util.DeepMerge'
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
     * Process and render the list of configuration files when
     * a configuration message is received from a robot.
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

        return NU.util.DeepMerge.merge({}, files);
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
                    content: decodeField(data),
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
                }
            })
        );
    }
});

/**
 * Recursively convert a field in the Configuration protobuf message to a simpler
 * JSON format with less nesting and no unnecessary fields
 *
 * @param  {Object} field   The field to convert
 * @param  {String} name    The name (key) of the field to convert. When given, the decoded field
 *                          object is wrapped inside this key
 * @return {Object}
 */
function decodeField(field, name) {
    if (field.kind === 'nullValue') {
        return wrapField({ value: null, tag: field.tag }, name);
    }

    if (field.kind === 'stringValue') {
        return wrapField({ value: field.stringValue, tag: field.tag }, name);
    }

    if (field.kind === 'numberValue') {
        return wrapField({ value: field.numberValue, tag: field.tag }, name);
    }

    if (field.kind === 'boolValue') {
        return wrapField({ value: field.boolValue, tag: field.tag }, name);
    }

    if (field.kind === 'listValue') {
        var decoded = {
            tag: field.tag,
            value: field.listValue.values.map(function(value) {
                return decodeField(value);
            })
        };

        return wrapField(decoded, name);
    }

    if (field.kind === 'mapValue') {
        var fields = field.mapValue.fields.map;
        var decoded = {
            value: {}
        };

        for (var subfield in fields) {
            decoded.value[subfield] = decodeField(fields[subfield].value);
        }

        return wrapField(decoded, name);
    }

    return 'LOL';
}

/**
 * Create an object with the given field nested in the given name
 *
 * @param  {Object} field   The field to wrap
 * @param  {[type]} name    The name (key) to nest the field in
 * @return {Object}
 */
function wrapField(field, name) {
    if (!name) {
        return field;
    }

    var wrapper = {};
    wrapper[name] = field;

    return wrapper;
}
