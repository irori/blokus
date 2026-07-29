var hm5move = Module.cwrap(
  'hm5move',
  'string',
  ['string', 'number', 'number', 'number'])

function getVisitedNodes() {
  return Module['_getVisitedNodes']();
}

function isValidPath(path) {
  return path.search(/^((0000|[1-9a-e]{2}[a-u][0-7])\/?)*$/) >= 0;
}

function depth(level) {
  switch (level) {
  case 2:
    return 10;
  case 3:
    return 10;
  }
  return 3;
}

function limit(level, player) {
  // Give Orange more time than Violet
  var mult = [0.9, 1.1][player];

  switch (level) {
  case 2:
    return 60 * mult;
  case 3:
    return 600 * mult;
  }
  return 60 * mult;
}  

function temperature(level) {
  switch (level) {
  case 2:
    return 1.5;
  case 3:
    return 1.0;
  }
  return 2.0;
}

function handle(data) {
  var path = data.path;
  var level = data.level;

  if (isValidPath(path)) {
    var start = Date.now();
    var player = path.split('/').length % 2;
    var move = hm5move(
      path, depth(level), limit(level, player), temperature(level));
    var elapsed = (Date.now() - start) / 1000;
    postMessage({'move': move, 'nps': getVisitedNodes() / elapsed});
  } else {
    postMessage({'move': "XXXX invalid path"});
  }
}

var ready = false;
var onReady;

addEventListener('message', function(e) {
  if (ready)
    handle(e.data);
  else
    onReady = function() { handle(e.data) };
});

if (!Module['preRun'])
    Module['preRun'] = [];
Module['preRun'].push(function() {
  ready = true;
  if (onReady)
    onReady();
});
