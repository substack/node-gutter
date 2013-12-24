var gutter = require('../../');
var through2 = require('through2');
var fs = require('fs');

var level = require('level');
var db = level('/tmp/gutter-example-db', { encoding: 'json' });
db.batch(require('./data.json'));

var out = gutter({
    name : 'hackerspaces',
    manifesto: fs.createReadStream(__dirname + '/manifesto.txt'),
    spaces: hackerspaces()
});
out.pipe(process.stdout);

function hackerspaces () {
    var opts = { start: 'hackerspace!', end: 'hackerspace!~' };
    return db.createReadStream(opts)
        .pipe(through2({ objectMode: true }, write))
    ;
    
    function write (row, enc, next) {
        var name = row.key.split('!')[1];
        this.push({
            name: name,
            founded: row.value.founded,
            hackers: hackers(name)
        });
        next();
    }
}

function hackers (hackerspace) {
    var start = 'hackerspace-hacker!' + hackerspace + '!';
    var opts = { start: start, end: start + '~' };
    return db.createReadStream(opts)
        .pipe(through2({ objectMode: true }, write))
    ;
    
    function write (row, enc, next) {
        var self = this;
        var name = row.key.split('!')[2];
        db.get('hacker!' + name, function (err, r) {
            if (err) return next(err);
            self.push({
                name: name,
                hackerspace: r.hackerspace
            });
            next();
        });
    }
}
