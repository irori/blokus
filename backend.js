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


function createBackend(handler) {
  return new WorkerBackend(handler);
}
