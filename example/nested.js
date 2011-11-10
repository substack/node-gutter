var gutter = require('../');
var fs = require('fs');

var out = gutter({
    name : 'words',
    version : '0.2.1',
    words : fs.createReadStream('/usr/share/dict/words')
});

out.pipe(process.stdout);
