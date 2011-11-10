var gutter = require('../');
var test = require('tap').test;

test('undef', function (t) {
    t.plan(1);
    
    var s = gutter({
        a : 3,
        b : undefined,
        c : null
    });
    
    var data = '';
    s.on('data', function (buf) {
        data += buf;
    });
    
    s.on('end', function () {
        t.deepEqual(JSON.parse(data), {
            a : 3,
            b : undefined,
            c : null
        });
    });
});
