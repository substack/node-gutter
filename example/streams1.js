var gutter = require('../');
var through = require('through');
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
out.pipe(process.stdout);

stream.resume();
stream.queue('d');
stream.queue(null);
