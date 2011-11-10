var gutter = require('../');

var EventEmitter = require('events').EventEmitter;
var stream = new EventEmitter;

var out = gutter({
    name : 'greetings',
    version : '1.2.3',
    greetings : stream,
    beep : 'boop'
});
out.pipe(process.stdout);

var ix = 0;
var iv = setInterval(function () {
    if (++ix === 4) clearInterval(iv)
    else {
        out.emit('data', ix);
    }
}, 200);
