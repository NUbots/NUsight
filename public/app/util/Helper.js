(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(); // export for Node
    } else if (window && window.Ext) {
        window.Ext.define('NU.util.Helper', factory());
    }
}(this, function () {
    return {
        singleton: true,

        /**
         * Check if the given JS value is an object
         *
         * @param  {Any}  value     The value to check
         * @return {Boolean}
         */
        isObject: function (value) {
            return typeof value === 'object' &&
                value &&
                Object.prototype.toString.call(value) !== '[object Array]'
        },

        /**
         * Merges the properties of one or more source objects onto target, recursively.
         * Properties of latter objects will override those of former objects. The
         * target is the first augment, and all other arguments are source objects.
         *
         * Adapted from https://github.com/bevacqua/assignment/blob/master/assignment.js
         *
         * @param   {Object} target   The target object
         * @returns {Object}          The target object with properties from source objects merged
         */
        deepMerge: function(target) {
            var item;
            var key;

            // Convert all arguments after the first into an array of source objects
            var sources = Array.prototype.slice.call(arguments).splice(1);

            while (sources.length) {
                item = sources.shift();

                for (key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (this.isObject(target[key])) {
                            if (typeof item[key] === 'object' && item[key] !== null) {
                                target[key] = this.deepMerge({}, target[key], item[key]);
                            } else {
                                target[key] = item[key];
                            }
                        } else {
                            target[key] = item[key];
                        }
                    }
                }
            }

            return target;
        }
    };
}));
