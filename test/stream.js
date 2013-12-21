var test = require('tape');
var through2 = require('through2');
var concat = require('concat-stream');
var gutter = require('../');

test('expand a streams2 stream', function (t) {
    t.plan(1);
    
    var stream = through2();
    stream.push('a');
    stream.push('b');
    stream.push('c');
    
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
            greetings: ['abc','d'],
            beep: 'boop'
        });
    }));

    stream.push('d');
    stream.push(null);
});
