(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(); // export for Node
    } else if (window && window.Ext) {
        window.Ext.define('NU.util.Configuration', factory());
    }
}(this, function () {
    var Helper = (typeof module === 'object' && module.exports)
        ? require('./Helper')
        : Ext.require('NU.util.Helper') && NU.util.Helper;

    return {
        singleton: true,

        /**
         * Convert the given list of config files to be compatible with the Configuration
         * protobuf message
         *
         * @param  {Array} files    The list of config files
         * @return {Array}
         */
        encodeConfig: function (files) {
            return files.map(function(file) {
                return {
                    path: file.path,
                    content: this.encodeField(file.content)
                };
            });
        },

        /**
         * Convert the field to be compatible with the Configuration protobuf message
         *
         * @param  {Object} field   The field to convert
         * @param  {String} name    The name (key) of the field
         * @return {Object}
         */
        encodeField: function (field, name) {
            var value = field.value;
            var tag = field.tag;

            if (typeof value === undefined || value === null) {
                return this.wrapField({ tag: tag, nullValue: 0 }, name);
            }

            if (typeof value === 'string') {
                return this.wrapField({ tag: tag, stringValue: value }, name);
            }

            if (typeof value === 'number') {
                return this.wrapField({ tag: tag, numberValue: value }, name);
            }

            if (typeof value === 'boolean') {
                return this.wrapField({ tag: tag, boolValue: value }, name);
            }

            if (Array.isArray(value)) {
                var encoded = {
                    tag: tag,
                    listValue: {
                        values: value.map(function (value) {
                            return this.encodeField(value)
                        }.bind(this))
                    }
                };

                return this.wrapField(encoded, name);
            }

            if (Helper.isObject(value)) {
                var encoded = {
                    mapValue: {
                        fields: {}
                    }
                };

                for (var subfield in value) {
                    encoded.mapValue.fields[subfield] = this.encodeField(value[subfield], subfield)[subfield];
                }

                return this.wrapField(encoded, name);
            }

            return 'LOL';
        },

        /**
         * Recursively convert a field in the Configuration protobuf message to a simpler
         * JSON format with less nesting and no unnecessary fields
         *
         * @param  {Object} field   The field to convert
         * @param  {String} name    The name (key) of the field to convert. When given, the decoded field
         *                          object is wrapped inside this key when returned.
         * @return {Object}
         */
        decodeField: function(field, name) {
            if (field.kind === 'nullValue') {
                return this.wrapField({ value: null, tag: field.tag }, name);
            }

            if (field.kind === 'stringValue') {
                return this.wrapField({ value: field.stringValue, tag: field.tag }, name);
            }

            if (field.kind === 'numberValue') {
                return this.wrapField({ value: field.numberValue, tag: field.tag }, name);
            }

            if (field.kind === 'boolValue') {
                return this.wrapField({ value: field.boolValue, tag: field.tag }, name);
            }

            if (field.kind === 'listValue') {
                var decoded = {
                    tag: field.tag,
                    value: field.listValue.values.map(function(value) {
                        return this.decodeField(value);
                    }.bind(this))
                };

                return this.wrapField(decoded, name);
            }

            if (field.kind === 'mapValue') {
                var fields = field.mapValue.fields.map;
                var decoded = {
                    value: {}
                };

                for (var subfield in fields) {
                    decoded.value[subfield] = this.decodeField(fields[subfield].value);
                }

                return this.wrapField(decoded, name);
            }

            return 'LOL';
        },

        /**
         * Create an object with the given field nested in the given name
         *
         * @param  {Object} field   The field to wrap
         * @param  {String} name    The name (key) to nest the field in
         * @return {Object}
         */
        wrapField: function (field, name) {
            if (!name) {
                return field;
            }

            var wrapper = {};
            wrapper[name] = field;

            return wrapper;
        }
    };
}));
