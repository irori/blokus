var hm5move = Module.cwrap('hm5move', 'string', ['string', 'number'])
var getVisitedNodes = Module.cwrap('getVisitedNodes', 'number')

function isValidPath(path) {
  return path.search(/^((----|[1-9a-e]{2}[a-u][0-7])\/?)*$/) >= 0;
}

function limit(level) {
  switch (level) {
  case 2:
    return 3000;
  case 3:
    return 10000;
  }
  return 1000;
}  

addEventListener('message', function(e) {
  var path = e.data.path;
  var level = e.data.level;

  if (isValidPath(path)) {
    var start = Date.now();
    var move = hm5move(path, limit(level));
    var elapsed = (Date.now() - start) / 1000;
    postMessage({'move': move, 'nps': getVisitedNodes() / elapsed});
  } else {
    postMessage({'move': "XXXX invalid path"});
  }
});
