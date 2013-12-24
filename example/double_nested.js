var through2 = require('through2');
var gutter = require('../');
var fs = require('fs');

//var b = through2({ objectMode: true });
var b = fs.createReadStream(__dirname + '/files/c.txt');
//b.push({ c: fs.createReadStream(__dirname + '/files/c.txt') });
//b.push(null);

var stream = through2({ objectMode: true });
stream.push({ a: 97 });
stream.push({ b: b });
//stream.push({ c: 98 });
stream.push(null);

var out = gutter({
    before : 'AAA',
    stream: stream,
    after : 'ZZZ'
});
out.pipe(process.stdout);
