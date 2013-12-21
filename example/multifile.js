var gutter = require('../');
var fs = require('fs');

var out = gutter({
    name : 'words',
    passwd : fs.createReadStream('/etc/passwd', { encoding : 'utf8' }),
    mtab: fs.createReadStream('/etc/mtab'),
    beep : 'boop'
});

out.pipe(process.stdout);
