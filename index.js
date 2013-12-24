var Readable = require('stream').Readable;
var inherits = require('inherits');

module.exports = Gutter;
inherits(Gutter, Readable);

function Gutter (root) {
    if (!(this instanceof Gutter)) return new Gutter(root);
    Readable.call(this);
    this.stack = [ root ];
}

Gutter.prototype._read = function () {
    if (this.stack.length === 0) return this.push(null);
    
    var current = this.stack.shift();
    var isObj = typeof current === 'object';
    
    if (current === undefined || current === null) {
        this.push('null');
    }
    else if (!isObj) {
        this.push(stringify(current));
    }
    else if (current instanceof Token) {
        this.push(current.token);
    }
    else if (isArray(current)) {
        var len = current.length;
        if (len === 0) return this.push('[]');
        
        var add = [];
        for (var i = 0; i < len; i++) {
            add.push(current[i], T(i === len - 1 ? ']' : ','));
        }
        this.stack.unshift.apply(this.stack, add);
        this.push('[');
    }
    else if (isStream(current)) {
        this.stack.unshift(current);
        this._readStream(current);
    }
    else if (Buffer.isBuffer(current)) {
        this.push(stringify(current.toString('utf8')));
    }
    else {
        var keys = objectKeys(current);
        var len = keys.length;
        if (len === 0) return this.push('{}');
        
        var add = [];
        for (var i = 0; i < len; i++) {
            var key = keys[i];
            add.push(
                key, T(':'), current[key],
                T(i === len - 1 ? '}' : ',')
            );
        }
        this.stack.unshift.apply(this.stack, add);
        this.push('{');
    }
};

Gutter.prototype._readStream = function f (stream) {
    var self = this;
    var firstData = false;
    
    if (!stream._marked) {
        firstData = true;
        stream._marked = true;
        stream.on('end', function () {
            stream._ended = true;
            self._read();
        });
    }
    
    (function reader () {
        var buf = stream.read();
        if (buf === null && stream._ended) {
            self.stack.shift();
            self.stack.unshift(T(']'));
            self._read();
        }
        if (buf === null) return stream.once('readable', reader);
        var prefix = firstData ? '[' : ',';
        self.stack.unshift(T(prefix), buf);
        self._read();
    })();
};

function T (s) { return new Token(s) }
function Token (s) { this.token = s }
 
var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var hasOwn = Object.prototype.hasOwnProperty;
var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
        if (hasOwn.call(obj, key)) keys.push(key);
    }
    return keys;
};

var stringify = JSON.stringify;

function isStream (s) {
    return s && typeof s === 'object' && typeof s.pipe === 'function';
}
