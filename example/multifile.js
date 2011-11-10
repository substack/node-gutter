var gutter = require('gutter');
var fs = require('fs');

var out = gutter({
    name : 'words',
    words : fs.createReadStream('/usr/share/dict/words', { encoding : 'utf8' }),
    passwd : fs.createReadStream('/etc/passwd', { encoding : 'utf8' }),
    beep : 'boop'
});

out.pipe(process.stdout);
