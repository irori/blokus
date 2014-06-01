function CGIBackend(handler) {
  this.handler = handler;
}

CGIBackend.prototype.request = function(path, level) {
  var self = this;
  var request = new window.XMLHttpRequest();
  request.open('GET', '/b/hm5move?l=' + level + '&b=' + path);
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


function PNaClBackend(handler) {
  var self = this;
  PNaClBackend.module.addEventListener('message', function(message_event) {
    var msg = message_event.data;
    var move = new Move(msg.move);
    self.handler(move);
    var elapsed = (Date.now() - self.startTime) / 1000;
    console.log(msg.visited_nodes / elapsed + ' nps');
  });
  this.handler = handler;
}

PNaClBackend.prototype.request = function(path, level) {
  var depth = [3, 10, 10][level - 1];
  var timeout = [1000, 1000, 10000][level - 1];
  PNaClBackend.module.postMessage({'path': path, 'depth': depth, 'timeout': timeout});
  this.startTime = Date.now();
}

PNaClBackend.moduleDidLoad = function() {
  var module = document.getElementById('hm5move_pnacl');
  if (module.postMessage)
    PNaClBackend.module = module;
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

  if (PNaClBackend.module)
    return new PNaClBackend(handler);
  else if (!Worker)
    return new CGIBackend(handler);
  else if (localOnly)
    return new WorkerBackend(handler);
  else
    return new FallbackBackend(CGIBackend, WorkerBackend, handler);
}
