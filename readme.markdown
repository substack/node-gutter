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



# methods

``` js
var gutter = require('gutter');
```

gutter(object)
--------------

Return a new json stream with stringify output from the json object `object`.
Any streams nested inside of `object` will be read and output as data becomes
available.

If there are multiple streams in `object`, the others will get paused and
buffered while waiting for each stream to finish.

Streams are treated as arrays with new elements for every `'data'` event.
To emit a streaming object using
[JSONStream](https://github.com/dominictarr/JSONStream)
`.stringifyStream()`, set `stream.type = 'object'`.

install
=======

With [npm](http://npmjs.org) do:

    npm install gutter

license
=======

MIT/X11
