var test = require('tape');
var through = require('through');
var concat = require('concat-stream');
var gutter = require('../');

test('expand a streams1 stream', function (t) {
    t.plan(1);
    
    var stream = through();
    stream.pause();
    stream.queue('a');
    stream.queue('b');
    stream.queue('c');
    
    var out = gutter({
        name : 'greetings',
        version : [1,2,3],
        greetings : stream,
        beep : 'boop'
    });
    out.pipe(concat(function (body) {
        t.deepEqual(JSON.parse(body), {
            name: 'greetings',
            version: [1,2,3],
            greetings: ['a','b','c','d'],
            beep: 'boop'
        });
    }));
    
    stream.resume();
    stream.queue('d');
    stream.queue(null);
});
