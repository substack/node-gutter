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
    var self = this;
    if (this.stack.length === 0) return this.push(null);
    
    var current = this.stack.shift();
    var isObj = typeof current === 'object';
    
    if (isObj && current instanceof Token) {
        this.push(current.token);
    }
    else if (isObj && isArray(current)) {
        var len = current.length;
        if (len === 0) return this.push('[]');
        
        var add = [];
        for (var i = 0; i < len; i++) {
            add.push(current[i], T(i === len - 1 ? ']' : ','));
        }
        this.stack.unshift.apply(this.stack, add);
        this.push('[');
    }
    else if (isObj && isStream(current)) {
        this.push('[STREAM]');
    }
    else if (isObj && current) {
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
    else if (current === undefined) {
        this.push('null');
    }
    else {
        this.push(stringify(current));
    }
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
