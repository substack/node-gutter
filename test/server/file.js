var test = require('tape');
var concat = require('concat-stream');
var fs = require('fs');
var gutter = require('../../');
var through2 = require('through2');

var sources = {
    mtab: fs.readFileSync(__dirname + '/mtab'),
    issue: fs.readFileSync(__dirname + '/issue'),
    legal: fs.readFileSync(__dirname + '/legal'),
    self: fs.readFileSync(__filename)
};

test('nested files', function (t) {
    t.plan(1);
    
    var files = through2({ objectMode: true });
    
    setTimeout(function () {
        files.push({ issue: fs.createReadStream(__dirname + '/issue') });
    }, 50);
    
    setTimeout(function () {
        files.push({ mtab: fs.createReadStream(__dirname + '/mtab') });
    }, 100);
    
    setTimeout(function () {
        var r = through2({ objectMode: true });
        files.push({ self: r });
        
        setTimeout(function () {
            r.push({ self: fs.createReadStream(__filename) });
            r.push(null);
        }, 100);
    }, 150);
    
    setTimeout(function () {
        files.push({ beep: 'boop' });
        files.push(null);
    }, 200);
    
    var out = gutter({
        name: 'files in streams in files',
        files: files,
        legal: fs.createReadStream(__dirname + '/legal'),
        hello : 'world'
    });
    out.pipe(concat(function (body) {
        console.log(body.toString('utf8'));
    }));
});
