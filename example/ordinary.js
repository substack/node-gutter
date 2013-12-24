var gutter = require('../');
var out = gutter({
    name : 'greetings',
    version : [1,2,3],
    beep : 'boop'
});
out.pipe(process.stdout);
