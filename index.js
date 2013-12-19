var Readable = require('_stream_readable');

module.exports = function (root) {
    var output = new Readable;
    output._read = function () {
        // what...
    };
    
    (function walk (node, cb) {
        if (isArray(node)) {
            var parts = [];
            for (var i = 0; i < node.length; i++) {
                if (isStream(node[i])) {
                    output.push('[' + parts.join(',') + ',');
                    return;
                }
                else parts.push(node[i]);
            }
            output.push('[' + parts.join(',') + ']');
            cb();
        }
        else if (typeof node === 'object') {
            var keys = objectKeys(node);
            var parts = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = node[key];
                if (isStream(value)) {
                    output.push('{' + parts.join(',') + ',');
                    return;
                }
                else {
                    parts.push(stringify(key) + ':' + stringify(value));
                }
            }
            output.push('{' + parts.join(',') + '}');
            cb();
        }
        else {
        }
    })(root);
    
    return output;
};

var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var hasOwn = Object.prototype.hasOwnProperty;
var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
        if (hasOwn.call(obj, key)) keys.push(key);j
    }
    return keys;
};

var stringify = JSON.stringify;

function isStream (s) {
    return s && typeof s === 'object' && typeof s.pipe === 'function';
}
