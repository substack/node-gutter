var gutter = require('../');
var fs = require('fs');

var out = gutter({
    platform : process.platform,
    arch: process.arch,
    issue: fs.createReadStream('/etc/issue')
});
out.pipe(process.stdout);
