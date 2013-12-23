var through2 = require('through2');
var concat = require('concat-stream');
var gutter = require('../');

var b = through2();
b.push('9');
b.push('8!');
b.push(null);

var stream = through2({ objectMode: true });

stream.push({ a: 97 });
stream.push({ b: b });
stream.push({ c: 99 });
setTimeout(function () { stream.push(null) }, 400);

var out = gutter({
    before : 'AAA',
    stream: stream,
    after : 'ZZZ'
});
out.pipe(process.stdout);
