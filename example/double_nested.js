var through2 = require('through2');
var gutter = require('../');
var fs = require('fs');

var c = through2({ objectMode: true });
c.push({ c: fs.createReadStream(__dirname + '/files/c.txt') });
c.push(null);

var stream = through2({ objectMode: true });
stream.push({ a: 97 });
stream.push({ c: c });
stream.push(null);

var out = gutter({
    before : 'AAA',
    stream: stream,
    after : 'ZZZ'
});
out.pipe(process.stdout);
