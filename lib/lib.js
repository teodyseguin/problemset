'use strict';

let stream = require('stream'),
  randtoken = require('rand-token');

class RandStream extends stream.Readable {

  constructor () {
    super ({
      encoding: 'utf8',
      objectMode: false,
      read: () => {
        setTimeout(() => {
          let chunk = randtoken.generate(
            Math.floor(5 + Math.random() * 25),
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'
          );
          console.log(`CHUNK: ${chunk}`);
          this.push(chunk, 'utf8');
        }, Math.random() * 1000);
      }
    });

  }
}

function asyncOp (input, callback) {
  console.log(`START: ${input}`);

  let prom = new Promise(function(resolve) {
    setTimeout(() => {
      console.log(`FINISH: ${input}`);
      resolve();
    }, Math.random() * 1000);
  });

  if(!callback) {
    return prom;
  }

  prom.then(callback);
}

module.exports = {
  RandStream,
  asyncOp
};
