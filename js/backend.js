'use strict';

function CGIBackend(handler) {
  this.url = '/b/hm5move'
  this.handler = handler;
}

CGIBackend.prototype.request = function(path, level) {
  var self = this;
  var request = new window.XMLHttpRequest();
  request.open('GET', this.url + '?l=' + level + '&b=' + path);
  request.onreadystatechange = function() {
    if (request.readyState != 4)
      return;
    var move;
    if (request.status == 200)
      move = new Move(request.responseText);
    self.handler(move);
  };
  request.timeout = 15 * 1000;
  request.send(null);
};


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


function FallbackBackend(remoteBackendFactory, localBackendFactory, handler) {
  var self = this;
  this.remote = new remoteBackendFactory(function(move) { self.handleRemote(move); });
  this.local = new localBackendFactory(handler);
  this.handler = handler;
}

FallbackBackend.prototype.request = function(path, level) {
  this.path = path;
  this.level = level;
  this.remote.request(path, level);
}

FallbackBackend.prototype.handleRemote = function(move) {
  if (move)
    this.handler(move);
  else
    this.local.request(this.path, this.level);
}

function createBackend(handler) {
  var localOnly = Blokus.level == 1;

  if (!Worker)
    return new CGIBackend(handler);
  else if (localOnly)
    return new WorkerBackend(handler);
  else
    return new FallbackBackend(CGIBackend, WorkerBackend, handler);
}
