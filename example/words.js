var gutter = require('../');
var fs = require('fs');
var es = require('event-stream');

var out = gutter({
    name : 'words',
    version : '0.2.1',
    words : es.connect(
        fs.createReadStream('/usr/share/dict/words'),
        es.split()
    )
});

out.pipe(process.stdout);
