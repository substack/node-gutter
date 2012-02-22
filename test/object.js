var gutter = require('../');
var test = require('tap').test;
var Stream = require('stream').Stream;

var EventEmitter = require('events').EventEmitter;

test('object emitter and stream', function (t) {
    t.plan(1);
    
    var ev = new EventEmitter;
    ev.type = 'object';
    (function () {
        var i = 0;
        var iv = setInterval(function () {
            if (++i === 5) {
                clearInterval(iv);
                ev.emit('end');
            }
            else ev.emit('data', [ String.fromCharCode(i + 96), i ])
        }, 10);
    })();
    
    var stream = new Stream;
    stream.type = 'object';
    (function () {
        var i = 0;
        var iv = setInterval(function () {
            if (++i === 4) {
                clearInterval(iv);
                stream.emit('end');
            }
            else stream.emit('data', [
                String.fromCharCode(97 + 26 - i),
                i * 100
            ])
        }, 10);
    })();
    
    var s = gutter([
        { foo : stream },
        'bar',
        11,
        { baz : ev }
    ]);
    
    var data = '';
    s.on('data', function (buf) {
        data += buf;
    });
    
    s.on('end', function () {
        t.deepEqual(
            JSON.parse(data),
            [
                { foo : { z : 100, y : 200, x : 300 } },
                'bar',
                11,
                { baz : { a : 1, b : 2, c : 3, d : 4 } },
            ]
        );
        t.end();
    });
});
