gutter
======

Streaming JSON.stringify() for nested streams

example
=======

``` js
var gutter = require('gutter');
var fs = require('fs');

var out = gutter({
    name : 'words',
    words : fs.createReadStream('/usr/share/dict/words', { encoding : 'utf8' }),
    passwd : fs.createReadStream('/etc/passwd', { encoding : 'utf8' }),
    beep : 'boop'
});

out.pipe(process.stdout);
```

methods
=======

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

install
=======

With [npm](http://npmjs.org) do:

    npm install gutter

license
=======

MIT/X11
