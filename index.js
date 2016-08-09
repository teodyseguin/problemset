'use strict';

const lib = require('./lib/lib'),
      RandStream = require('./lib/lib').RandStream,
      EventEmitter = require('events');

// Answer for #1. Asynchronous Operations
function doAsync(arr) {
    arr.map(index => {
        let isArray = typeof index === 'object';

        if (!isArray) {
            lib.asyncOp(index);
        }
        else {
            index.map(index2 => {
                lib.asyncOp(index2);
            });
        }
    });
}

// Answer for #2. Streams
class RandStringSource extends EventEmitter {
    constructor(rs) {
        super();
        this._remainder = null;
        this._read(rs);
    }

    _read(rs) {
        rs.on('data', chunk => {
            let dotIsFound = chunk.indexOf('.'),
                chunkContainer;

            if (dotIsFound >= 0) {
                chunkContainer = chunk.split('.');
                this._sendForEmit(chunkContainer);
            }
        });
    }

    _sendForEmit(cc) {
        // we need to extract the last item, because that represents the opening
        // of the '.' enclosure and concatenate it to the next first item, as 
        // that would serve as the ending '.' enclosure
        if (cc.length === 2) {
            this._emit(cc[0], true);
            this._remainder = cc[1];
        }
        else {
            let lastItem = cc[cc.length - 1],
                first = true;
            cc.pop();

            cc.forEach(index => {
                if (first) {
                    this._emit(index, true);
                    first = false;
                }
                else {
                    this._emit(index);
                }
            });

            this._remainder = lastItem;
        }
    }

    _emit(payload, first = false) {
        if (this._remainder !== null && first === true) {
            this.emit('data', this._remainder + payload);
        }
        else {
            this.emit('data', payload);
        }
    }
}

// Answer for #3. Resource Pooling
class ResourceManager {
    constructor(count) {
        this._resourceCount = count;
        this._cachedId = [];
        this._resourcePrefix = 'resource-';
        this._rs = new ResourceSingleton();

        this._generateResource();
    }

    _generateResource() {
        for (var i = 1; i <= this._resourceCount; i++) {
            var id = this._resourcePrefix + i;
            this._rs.register(id, new Resource());
        }
    }

    borrow(callback) {
        if (this._resourceCount !== 0) {
            let id = this._resourcePrefix + this._resourceCount;
            this._resourceCount--;
            this._cachedId.push(id);
            return callback(this._rs.get(id), id);
        }
        else {
            this._cachedId.forEach(id => {
                let r = this._rs.get(id);
                r.on('released', () => {
                    this._resourceCount++;
                    return callback(this._rs.get(id), id);
                });
            });
        }
    }
}

class Resource extends EventEmitter {
    constructor() {
        super();
        this._released = false;
    }

    release() {
        this._released = true;
        this.emit('released');
    }
}

// We have this singleton class to keep track of every resources which
// are borrowed and released from our implementation below
class ResourceSingleton {
    constructor() {
        this._resources = {};
    }

    register(id, cls) {
        this._resources[id] = cls;
    }

    get(id) {
        return this._resources[id];
    }
}

// Orchestrate our outputs here. The appropriate function will be called,
// depending on the command line argument provided. The list of available
// command line arguments are found below
let async = function() {
         let input = [
             'A',
             ['B', 'C'],
             'D'
         ];

         doAsync(input);
    },
    stream = function() {
        let rss = new RandStringSource(new RandStream());
        rss.on('data', (data) => {
            console.log(`--- Payload is: ${data} ---`);
        });
    },
    resource = function() {
        let rm = new ResourceManager(2);
        console.log('START');

        rm.borrow((res, id) => {
            console.log(`RES 1 | Resource borrowed is: ${id}`);
            setTimeout(() => {
                res.release();
            }, 1000);
        });

        rm.borrow((res, id) => {
            console.log(`RES 2 | Resource borrowed is: ${id}`);
        });

        rm.borrow((res, id) => {
            console.log(`RES 3 | Resource borrowed is: ${id}`);
        });
    };

// These are the command line arguments which you can feed on when running the script
// Each argument correspond to a particular function invocation, that are defined above.
// e.g. node index.js async
// e.g. node index.js stream
// e.g. node index.js resource
process.argv.forEach(function (val, index, array) {
    switch (val) {
        case 'async':
            async();
            break;
        case 'stream':
            stream();
            break;
        case 'resource':
            resource();
            break;
    }
});
