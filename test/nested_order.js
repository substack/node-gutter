var through2 = require('through2');
var concat = require('concat-stream');
var gutter = require('../');
var test = require('tape');
var fs = require('fs');

test('nested streams that end in a delayed order', function (t) {
    t.plan(1);
    
    var c = through2({ objectMode: true });
    c.push({ ccc: fs.createReadStream(__dirname + '/files/c.txt') });
    
    var stream = through2({ objectMode: true });
    stream.push({ a: 97 });
    stream.push({ c: c });
    c.push(null);
    stream.push(null);

    var out = gutter({
        before : 'AAA',
        stream: stream,
        after : 'ZZZ'
    });
    out.pipe(concat(function (body) {
        t.deepEqual(JSON.parse(body), {
            before: 'AAA',
            stream: [ { a: 97 }, { c: [ { ccc: [ 'CCCCCCC\n' ] } ] } ],
            after: 'ZZZ'
        });
    }));
});
