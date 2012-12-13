/**
 * Language Module
 *
 * Adapted from OzJS's lang module and underscore
 * https://github.com/dexteryy/OzJS/blob/master/mod/lang.js
 * https://github.com/documentcloud/underscore/blob/master/underscore.js 
 */

var arrayProto = Array.prototype,
    objProto = Object.prototype,
    toString = objProto.toString,
    slice = arrayProto.slice,
    typeRegex = '';

// 返回对象的类型
exports.type = function type(obj) {
    return obj == null ? String(obj) :
        toString.call(obj).toLowerCase().substring(8, type.length - 1);
};

// from jQuery
exports.isPlainObject = function isPlainObject(obj) {
    var key;
    if (!obj || type(obj) !== 'object' ||
        obj.nodeType || 'setInterval' in obj) {
        return false;
    }

    if ( obj.constructor &&
        !hasOwn.call(obj, 'constructor') &&
        !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
        return false;
    }

    for (key in obj) {}

    return key === undefined || has(obj, key);
};

// from jQuery
// extend([deep,] target, obj1 [, objN])
exports.extend = function extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && type(target) !== 'function') {
        target = {};
    }

    // extend caller itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i<length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = arguments.callee(deep, clone, copy);

                // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

exports.proxy = function proxy(fn, context) {
    var args = slice.call(arguments, 2);
    return function () {
        return fn.apply(context, args.concat(slice.call(arguments)));
    };
};

// generate uuid
// from jqMobi(http://www.jqmobi.com)
exports.uuid = function uuid() {
    var S4 = function () {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
};

// find element in source which not in rest
exports.difference = function difference(source, rest) {
    if (!Array.isArray(rest)) {
        return source;
    }
    return source.filter(function (value) {
        return rest.indexOf(value) === -1;
    });
};