# gutter

json stringify nested streams

[![build status](https://secure.travis-ci.org/substack/node-gutter.png)](https://travis-ci.org/substack/node-gutter)

# example

Gutter behaves just like `JSON.stringify()`, except it returns a stream and will
expand any nested streams it encounters. For example, this object stringifies
some properties and contains some inline content from `/etc/issue`:

``` js
var gutter = require('gutter');
var fs = require('fs');

var out = gutter({
    platform : process.platform,
    arch: process.arch,
    issue: fs.createReadStream('/etc/issue')
});
out.pipe(process.stdout);
```

# nested leveldb queries

For a more complicated example, suppose we want to generate a json dump with
nested properties, but to nest these properties, we need to run another
streaming query for each document. With `gutter`, you can write a stream query
that embeds nested streams into the output objects:

```
var gutter = require('gutter');
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
```

As the document is traversed, each stream encountered is expanded in-place to
generate the complete output without buffering the whole thing into memory:

```
{"name":"hackerspaces","manifesto":["Yes, I am a criminal.  My crime is that of curiosity.  My crime is that of\njudging people by what they say and think, not what they look like. My crime is\nthat of outsmarting you, something that you will never forgive me for.\n\nI am a hacker, and this is my manifesto.  You may stop this individual, but you\ncan't stop us all... after all, we're all alike.\n"],"spaces":[{"name":"noisebridge","founded":2007,"hackers":[{"name":"ioerror","hackerspace":"noisebridge"},{"name":"mitch","hackerspace":"noisebridge"}]},{"name":"sudoroom","founded":2011,"hackers":[{"name":"maxogden","hackerspace":"sudoroom"},{"name":"mk30","hackerspace":"sudoroom"},{"name":"substack","hackerspace":"sudoroom"},{"name":"wrought","hackerspace":"sudoroom"},{"name":"yardena","hackerspace":"sudoroom"}]}]}
```

# methods

``` js
var gutter = require('gutter');
```

## var stream = gutter(object)

Return a new readable `stream` of json text from a recursive stringification of
`object`, expanding streams in-place into arrays.

# install

With [npm](http://npmjs.org) do:

```
npm install gutter
```

# license

MIT
