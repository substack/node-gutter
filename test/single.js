var gutter = require('../');
var fs = require('fs');
var test = require('tap').test;
var EventEmitter = require('events').EventEmitter;
var pauseStream = require('pause-stream');
var es = require('event-stream');

var words = fs.readFileSync(__dirname + '/words.txt', 'utf8')
    .split(/\n/)
    .slice(0, -1)
    .map(function (s) { return s + '\n' })
;

test('single stream', function (t) {
    t.plan(1);
    
    var s = gutter({
        a : 3,
        b : 4,
        stream : es.connect(
            fs.createReadStream(__dirname + '/words.txt'),
            es.split()
        ),
        c : 5
    });
    
    var data = '';
    s.on('data', function (buf) {
        data += buf;
    });
    
    s.on('end', function () {
        t.deepEqual(
            JSON.parse(data),
            {
                a : 3,
                b : 4,
                stream : words,
                c : 5
            }
        );
        t.end();
    });
});

test('single stream with an event emitter', function (t) {
    t.plan(1);
    
    var ws = words.slice();
    var emitter = new EventEmitter;
    var iv = setInterval(function () {
        if (ws.length === 0) {
            clearInterval(iv);
            emitter.emit('end');
        }
        else emitter.emit('data', ws.shift())
    }, 5);
    
    var s = gutter({
        a : 3,
        b : 4,
        stream : emitter,
        c : 5
    });
    
    var data = '';
    s.on('data', function (buf) {
        data += buf;
    });
    
    s.on('end', function () {
        t.deepEqual(
            JSON.parse(data),
            {
                a : 3,
                b : 4,
                stream : words,
                c : 5
            }
        );
        t.end();
    });
});

test('single stream with a pauseStream', function (t) {
    t.plan(1);
    
    var bs = pauseStream();
    bs.pause();
    
    es.connect(
        fs.createReadStream(__dirname + '/words.txt'),
        es.split()
    ).pipe(bs);
    
    var s = gutter({
        a : 3,
        b : 4,
        stream : bs,
        c : 5
    });
    
    var data = '';
    s.on('data', function (buf) {
        data += buf;
    });
    
    s.on('end', function () {
        t.deepEqual(
            JSON.parse(data),
            {
                a : 3,
                b : 4,
                stream : words,
                c : 5
            }
        );
        t.end();
    });
    
    bs.resume();
});
