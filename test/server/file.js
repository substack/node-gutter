var test = require('tape');
var concat = require('concat-stream');
var fs = require('fs');
var path = require('path');
var gutter = require('../../');
var through2 = require('through2');

var sources = {
    mtab: fs.readFileSync(__dirname + '/files/mtab', 'utf8'),
    issue: fs.readFileSync(__dirname + '/files/issue', 'utf8'),
    legal: fs.readFileSync(__dirname + '/files/legal', 'utf8'),
    self: fs.readFileSync(__filename, 'utf8')
};

function readStream (file) {
    return fs.createReadStream(path.join(__dirname, 'files', file));
}

test('nested files', function (t) {
    t.plan(8);
    
    var files = through2({ objectMode: true });
    
    setTimeout(function () {
        files.push({ issue: readStream('issue') });
    }, 50);
    
    setTimeout(function () {
        files.push({ mtab: readStream('/mtab') });
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
        legal: readStream('legal'),
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
            r.files.map(function (x) { return Object.keys(x)[0] }),
            [ 'issue', 'mtab', 'self', 'beep' ]
        );
        t.equal(r.files[0].issue.join(','), sources.issue);
        t.equal(r.files[1].mtab.join(','), sources.mtab);
        t.equal(r.files[2].self[0].self.join(','), sources.self);
    }));
});
