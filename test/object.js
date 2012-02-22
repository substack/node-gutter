var gutter = require('../');
var test = require('tap').test;

var EventEmitter = require('events').EventEmitter;

test('object stream', function (t) {
    t.plan(1);
    
    var ev = new EventEmitter;
    var i = 0;
    var iv = setInterval(function () {
        if (++i === 5) {
            clearInterval(iv);
            ev.emit('end');
        }
        else ev.emit('data', [ String.fromCharCode(i + 97), i ])
    }, 10);
    
    var s = gutter([
        'foo', 5, 'bar', { baz : ev }
    ]);
    
    var data = '';
    s.on('data', function (buf) {
        data += buf;
    });
    
    s.on('end', function () {
        t.deepEqual(
            JSON.parse(data),
            [ 'foo', 5, 'bar', { baz : { a : 1, b : 2 } } ]
        );
        t.end();
    });
});
