var Readable = require('stream').Readable;

module.exports = function (root) {
    var output = new Readable;
    var reader = function () {
        walk(root, end);
        reader();
    };
    
    output._read = function () { reader() };
    
    function walk (node, done) {
        if (isArray(node)) {
            var len = node.length;
            var index = 0;
            
            reader = function f () {
                if (index >= len) {
                    output.push(']');
                    return done();
                }
                if (index === 0) output.push('[');
                else output.push(',');
                
                walk(node[index++], function () {
                    reader = f;
                });
            };
        }
        else if (isStream(node)) {
            var stream = typeof node.read === 'function'
                ? node
                : new Readable({ objectMode: true }).wrap(node)
            ;
            var index = 0;
            
            stream.on('end', function () {
                done();
                output.push(']');
            });
            
            reader = function f () {
                var buf = stream.read();
                if (buf === null) return stream.once('readable', f);
                if (index++ === 0) output.push('[')
                else output.push(',');
                
                if (Buffer.isBuffer(buf)) {
                    walk(buf.toString('utf8'), onwalk);
                }
                else walk(buf, onwalk)
                
                function onwalk () { reader = f };
            };
        }
        else if (node && typeof node === 'object') {
            var keys = objectKeys(node);
            var len = keys.length;
            var index = 0;
            var first = true;
            
            reader = function f () {
                if (index >= len) {
                    output.push('}');
                    return done();
                }
                
                var key = keys[index++];
                //if (node[key] === undefined) return next;
                
                if (first) output.push('{');
                else output.push(',');
                first = false;
                
                walk(node[key], function () {
                    reader = f;
                });
                output.push(stringify(key) + ':');
            };
        }
        else if (node === undefined) {
            reader = function () {
                output.push('null');
                done();
            };
        }
        else {
            reader = function () {
                output.push(stringify(node));
                done();
            };
        }
    }
    
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
