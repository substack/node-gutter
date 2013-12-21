var Readable = require('stream').Readable;

module.exports = function (root) {
    var output = new Readable;
    
    var waiting = false;
    var current = null;
    var currentIndex = 0;
    
    output._read = function f () {
        if (!current) return waiting = f;
        waiting = false;
        
        var buf = current.read();
        if (buf === null && current._ended === true) {
            output.push(']');
            var d = current._done;
            current = null;
            return d();
        }
        if (buf === null) return waiting = f;
        if (currentIndex++ > 0) output.push(',');
        
        if (Buffer.isBuffer(buf)) {
            output.push(stringify(buf.toString('utf8')));
        }
        else output.push(stringify(buf));
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
            output.push('[');
            currentIndex = 0;
            if (typeof node.read === 'function') {
                current = node;
                current.on('end', function () {
                    output.push(']');
                    current = null;
                    done();
                });
            }
            else {
                current = new Readable({ objectMode: true });
                current._read = function () {};
                current._ended = false;
                
                node.on('data', function (buf) {
                    current.push(buf);
                    if (waiting) waiting();
                });
                node.on('end', function () {
                    current.push(null);
                    if (waiting) waiting();
                    current._ended = true;
                    current._done = done;
                });
            }
            if (waiting) waiting();
        }
        else if (typeof node === 'object') {
            var keys = objectKeys(node);
            var len = keys.length;
            var index = 0;
            var first = true;
            
            output.push('{');
            
            (function next () {
                if (index >= len) {
                    output.push('}');
                    done();
                }
                else {
                    var key = keys[index++];
                    if (node[key] === undefined) return next;
                    
                    if (!first) output.push(',');
                    first = false;
                    
                    output.push(stringify(key) + ':');
                    walk(node[key], next);
                }
            })();
        }
        else if (node === undefined) {
            output.push('null');
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
