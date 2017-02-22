/**
 * @author Josephus Paye II
 */
Ext.define('NU.util.DeepMerge', {
    singleton: true,

    /**
     * Merges the properties of one or more source objects onto target, recursively.
     * Properties of latter objects will override those of former objects.
     *
     * Adapted from https://github.com/bevacqua/assignment/blob/master/assignment.js
     *
     * @param   {Object} target   The target object
     * @param   {Array}  sources  Array of source objects to merge unto to target
     * @returns {Object}          The target object with properties from source objects merged
     */
    merge: function(target, sources) {
        var item;
        var key;

        while (sources.length) {
            item = sources.shift();

            for (key in item) {
                if (item.hasOwnProperty(key)) {
                    if (typeof target[key] === 'object' && target[key] && Object.prototype.toString.call(target[key]) !== '[object Array]') {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            target[key] = NU.util.DeepMerge.merge({}, [target[key], item[key]]);
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
});
