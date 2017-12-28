'use strict';

function WorkerBackend(handler) {
  var self = this;
  this.worker = new Worker('js/hm5move.js');
  this.worker.addEventListener('message', function(e) {
    var move = new Move(e.data.move);
    console.log(e.data.nps + ' nps');
    self.handler(move);
  });
  this.handler = handler;
}

WorkerBackend.prototype.request = function(path, level) {
  this.worker.postMessage({'path': path, 'level': level});
}

function createBackend(handler) {
  return new WorkerBackend(handler);
}
