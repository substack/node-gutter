var Readable = require('_stream_readable');

module.exports = function (root) {
    var output = new Readable;
    output._read = function () {
        // what...
    };
    
    (function walk (node, done) {
        if (isArray(node)) {
            var len = node.length;
            var index = 0;
            
            output.push('[');
            (function next () {
                if (index >= len) {
                    output.push(']');
                    done();
                }
                else {
                    if (index > 0) output.push(',');
                    walk(node[index++], next);
                }
            })();
        }
        else if (isStream(node)) {
            output.push('[STREAM]');
            done();
        }
        else if (typeof node === 'object') {
            var keys = objectKeys(node);
            var len = keys.length;
            var index = 0;
            
            output.push('{');
            
            (function next () {
                if (index >= len) {
                    output.push('}');
                    done();
                }
                else {
                    if (index > 0) output.push(',');
                    var key = keys[index++];
                    output.push(stringify(key) + ':');
                    walk(node[key], next);
                }
            })();
        }
        else if (node === undefined) {
            done();
        }
        else {
            output.push(stringify(node));
            done();
        }
    })(root, end);
    
    return output;
    
    function end () {
        output.push(null);
    }
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
