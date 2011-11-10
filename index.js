var sjson = require('JSONStream');
var traverse = require('traverse');
var BufferedStream = require('morestreams').BufferedStream;
var EventEmitter = require('events').EventEmitter;
var Stream = require('stream').Stream;

module.exports = function (obj) {
    var output = new BufferedStream;
    output.readable = true;
    output.writable = false;
    
    var parts = split(obj).map(function (part) {
        if (typeof part === 'string') {
            return part;
        }
        else if (part instanceof BufferedStream) {
            part.pause();
            return part;
        }
        else if (part instanceof Stream) {
            var s = new BufferedStream();
            s.readable = true;
            s.writable = true;
            part.pipe(s);
            
            part.pause();
            s.pause();
            return s;
        }
        else {
            var s = new BufferedStream();
            s.readable = true;
            s.writable = true;
            s.pause();
            part.on('data', function (buf) {
                s.write(buf);
            });
            part.pause();
            return s;
        }
    });
    
    process.nextTick(function pop () {
        if (parts.length === 0) {
            output.emit('end');
            return;
        };
        
        var part = parts.shift();
        if (typeof part === 'string') {
            output.emit('data', part);
            pop();
        }
        else {
            var s = sjson.stringify();
            s.on('data', function (buf) {
                output.emit('data', buf);
            });
            part.pipe(s);
            
            part.on('end', pop);
            part.resume();
        }
    });
    
    return output;
};

function split (obj) {
    var parts = [];
    var s = '';
    traverse(obj).forEach(function to_s (node) {
        if (node instanceof EventEmitter) {
            if (s.length) {
                parts.push(s);
                s = '';
            }
            parts.push(node);
            this.block();
        }
        else if (Array.isArray(node)) {
            this.before(function () { s += '[' });
            this.post(function (child) {
                if (!child.isLast) s += ',';
            });
            this.after(function () { s += ']' });
        }
        else if (typeof node == 'object') {
            this.before(function () { s += '{' });
            this.pre(function (x, key) {
                to_s(key);
                s += ':';
            });
            this.post(function (child) {
                if (!child.isLast) s += ',';
            });
            this.after(function () { s += '}' });
        }
        else if (typeof node == 'string') {
            s += '"' + node.toString().replace(/"/g, '\\"') + '"';
        }
        else if (typeof node == 'function') {
            s += 'null';
        }
        else {
            s += node.toString();
        }
    });
    
    if (s.length) parts.push(s);
    return parts;
}
