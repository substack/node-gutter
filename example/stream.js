var gutter = require('../');
var through2 = require('through2');

var out = gutter({
    name : 'greetings',
    version : '1.2.3',
    greetings : createStream([ 'a', 'b', 'c', 'd' ]),
    beep : 'boop'
});
out.pipe(process.stdout);

function createStream (bufs) {
    var stream = through2();
    (function next (index) {
        if (index >= bufs.length) {
            stream.push(null);
        }
        else {
            stream.push(bufs[index]);
            setTimeout(next, 100);
        }
    })(0);
    return stream;
}
