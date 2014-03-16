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
    if (request.status != 200)
      throw new Error('status: ' + request.status);
    var move = new Move(request.responseText);
    self.handler(move);
  };
  request.send(null);
};


function WorkerBackend(handler) {
  var self = this;
  this.worker = new Worker('hm5move.js');
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
  var timeout = [1000, 3000, 10000][level - 1];
  PNaClBackend.module.postMessage({'path': path, 'timeout': timeout});
  this.startTime = Date.now();
}

PNaClBackend.moduleDidLoad = function() {
  PNaClBackend.module = document.getElementById('hm5move_pnacl');
}


function createBackend(handler) {
  if (PNaClBackend.module)
    return new PNaClBackend(handler);
  else
    return new WorkerBackend(handler);
}
