var test = require('tape');
var concat = require('concat-stream');
var fs = require('fs');
var gutter = require('../../');
var through2 = require('through2');

var sources = {
    mtab: fs.readFileSync(__dirname + '/mtab', 'utf8'),
    issue: fs.readFileSync(__dirname + '/issue', 'utf8'),
    legal: fs.readFileSync(__dirname + '/legal', 'utf8'),
    self: fs.readFileSync(__filename, 'utf8')
};

test('nested files', function (t) {
    t.plan(8);
    
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
        var r = JSON.parse(body);
        t.equal(r.name, 'files in streams in files');
        t.equal(r.legal.join(','), sources.legal);
        t.equal(r.hello, 'world');
        t.deepEqual(
            Object.keys(r).sort(),
            ['files','hello','legal','name']
        );
        
        t.deepEqual(
            Object.keys(r.files).sort(),
            ['issue','mtab','self']
        );
        t.equal(r.files.issue.join(','), sources.issue);
        t.equal(r.files.mtab.join(','), sources.mtab);
        t.equal(r.files.self.self.join(','), sources.self);
    }));
});
