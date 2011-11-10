var gutter = require('gutter');
var fs = require('fs');

var out = gutter({
    name : 'words',
    version : '0.2.1',
    words : fs.createReadStream('/usr/share/dict/words', { encoding : 'utf8' })
});

out.pipe(process.stdout);
