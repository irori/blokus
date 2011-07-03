var Blokus = { level: 1 };
var SCALE = 20;

function rotate(elem, dir, x, y) {
  switch (dir) {
  case 'left':
    dir = (elem.direction + [6, 2][elem.direction & 1]) & 7;
    break;
  case 'right':
    dir = (elem.direction + [2, 6][elem.direction & 1]) & 7;
    break;
  case 'flip':
    dir = elem.direction ^ 1;
    break;
  }

  elem.direction = dir;
  var rot = blockSet[elem.blockId].rotations[dir];
  for (var i = 0; i < rot.size; i++) {
    elem.childNodes[i].style.left = rot.coords[i].x * SCALE + 'px';
    elem.childNodes[i].style.top = rot.coords[i].y * SCALE + 'px';
  }
  if (x != undefined) {
    elem.style.left = x - SCALE / 2 + 'px';
    elem.style.top = y - SCALE / 2 + 'px';
  }
}

function toBoardPosition(x, y) {
  var boardStyle = getStyle('board');
  x -= parseInt(boardStyle.left) + parseInt(boardStyle.borderLeftWidth);
  y -= parseInt(boardStyle.top) + parseInt(boardStyle.borderTopWidth);
  x = Math.round(x / SCALE);
  y = Math.round(y / SCALE);
  if (Blokus.board.inBounds(x, y))
    return {x: x, y: y};
  else
    return null;
}

function fromBoardPosition(pos) {
  var boardStyle = getStyle('board');
  return {
    x: pos.x * SCALE + parseInt(boardStyle.left) +
      parseInt(boardStyle.borderLeftWidth),
    y: pos.y * SCALE + parseInt(boardStyle.top) +
      parseInt(boardStyle.borderTopWidth)
  };
}

function createPiece(x, y, id, dir) {
  var elem = document.createElement('div');
  elem.id = 'b' + id;
  elem.blockId = id;
  elem.direction = dir;
  elem.setAttribute('style',
                    'left:' + x + 'px;' +
                    'top:' + y + 'px;' +
                    'position:absolute;');
  piece = blockSet[id].rotations[dir].piece;
  for (var i = 0; i < piece.size; i++) {
    var cell = document.createElement('div');
    cell.setAttribute('style',
                      'position:absolute;' +
                      'left:' + piece.coords[i].x * SCALE + 'px;' +
                      'top:' + piece.coords[i].y * SCALE + 'px;' +
                      'width:' + SCALE + 'px;' +
                      'height:' + SCALE + 'px;');
    cell.className = 'block' + Blokus.player;
    elem.appendChild(cell);
  }

  document.getElementById('pieces').appendChild(elem);
  return elem;
}

var piecePositionTable = [ // x, y, dir
  [1, 1, 0], // u
  [5, 1, 0], // t
  [9, 1, 0], // s
  [13, 1, 0], // r
  [16, 2, 0], // q
  [21, 1, 0], // p
  [24, 1, 0], // o
  [1, 5, 0], // n
  [4, 5, 0], // m
  [7, 5, 2], // l
  [12, 5, 2], // k
  [18, 5, 2], // j
  [23, 5, 0], // i
  [0, 8, 0], // h
  [4, 8, 2], // g
  [8, 9, 2], // f
  [13, 8, 2], // e
  [16, 9, 0], // d
  [20, 9, 2], // c
  [23, 8, 0], // b
  [25, 9, 0]  // a
];

function createPieces() {
  var area = getStyle('piece-area');
  var left = parseInt(area.left) + parseInt(area.paddingLeft);
  var top = parseInt(area.top) + parseInt(area.paddingTop);
  for (var i = 0; i < piecePositionTable.length; i++) {
    var a = piecePositionTable[i];
    var e = createPiece(left + a[0] * SCALE, top + a[1] * SCALE, i, a[2]);
    if (Blokus.board.isUsed(Blokus.player, i))
      e.style.visibility = 'hidden';
  }
}

function createOpponentsPieces() {
  var area = document.getElementById('opponents-pieces');
  for (var id = 0; id < piecePositionTable.length; id++) {
    var a = piecePositionTable[id];
    var x = 9 - a[1];
    var y = a[0];
    var dir = (a[2] + 2) & 7;
    var s = SCALE >> 1;
    var piece = blockSet[id].rotations[dir];

    var elem = document.createElement('div');
    elem.id = 'o' + id;
    elem.setAttribute('style',
                      'left:' + x * s + 'px;' +
                      'top:' + y * s + 'px;' +
                      'position:absolute;');
    for (var i = 0; i < piece.size; i++) {
      var cell = document.createElement('div');
      cell.setAttribute('style',
                        'position:absolute;' +
                        'left:' + piece.coords[i].x * s + 'px;' +
                        'top:' + piece.coords[i].y * s + 'px;' +
                        'width:' + s + 'px;' +
                        'height:' + s + 'px;');
      cell.className = 'block' + (1 - Blokus.player);
      elem.appendChild(cell);
    }
    if (Blokus.board.isUsed(1 - Blokus.player, id))
      elem.style.visibility = 'hidden';
    area.appendChild(elem);
  }
}

function updateBoardView() {
  var boardElem = document.getElementById('board');
  for (var i = 0; i < Blokus.board.turn(); i++) {
    var move = Blokus.board.history[i];
    if (move.isPass())
      continue;
    var coords = move.coords();
    for (var j = 0; j < coords.length; j++) {
      var x = coords[j].x;
      var y = coords[j].y;
      cell = document.createElement('div');
      cell.id = i + '_' + j;
      cell.setAttribute('style',
                        'position:absolute;' +
                        'left:' + x * SCALE + 'px;' +
                        'top:' + y * SCALE + 'px;' +
                        'width:' + SCALE + 'px;' +
                        'height:' + SCALE + 'px;');
      cell.className = ['block0', 'block1'][i % 2];
      boardElem.appendChild(cell);
    }
    var id = (i % 2 == Blokus.player ? 'b' : 'o') + move.blockId();
    var elem = document.getElementById(id);
    elem.id = i + '_p';
  }
}

function updateRecord() {
  var table = document.getElementById('record');
  for (var i = 0; i < Blokus.board.turn(); i++) {
    var row = table.insertRow(-1);
    row.className = ['record-violet', 'record-orange'][i % 2];
    row.insertCell(0).innerHTML = i + 1;
    row.insertCell(1).innerHTML = Blokus.board.history[i];
    row.onmouseover = highlightCallback(row, i, true);
    row.onmouseout = highlightCallback(row, i, false);
    row.onclick = (function(t) { return function() { rollback(t); }})(i);
  }
}

function highlightCallback(row, turn, hilit) {
  return function() {
    if (hilit)
      row.className += ' record-highlight';
    else
      row.className = row.className.replace(' record-highlight', '');
    for (var i = 0; i < 5; i++) {
      var e = document.getElementById(turn + '_' + i);
      if (!e)
        break;
      e.className = 'block' + turn % 2 + (hilit ? 'highlight' : '');
    }
  }
}

function rollback(turn) {
  document.getElementById('back-button').disabled = turn <= 0;
  document.getElementById('forward-button').disabled =
    turn >= Blokus.board.turn() - 1;
  Blokus.displayTurn = turn;
  var table = document.getElementById('record');
  for (var i = 0; i < Blokus.board.turn(); i++) {
    var row = table.rows[i];
    if (row) {
      var cls = 'record-gray';
      if (i <= turn)
        cls = ['record-violet', 'record-orange'][i % 2];
      row.className = row.className.replace(/record-(violet|orange|gray)/, cls);
    }
    var e = document.getElementById(i + '_p');
    if (e)
      e.style.visibility = (i <= turn ? 'hidden' : 'visible');
    for (var j = 0; j < 5; j++) {
      e = document.getElementById(i + '_' + j);
      if (e)
        e.style.visibility = (i <= turn ? 'visible' : 'hidden');
    }
  }
}

// functions called from result.html

function backButton() {
  rollback(Blokus.displayTurn - 1);
}

function forwardButton() {
  rollback(Blokus.displayTurn + 1);
}

function init() {
  var path = window.location.hash.substring(3);
  Blokus.board = new Board(path);
  Blokus.player = parseInt(window.location.hash.charAt(1));
  Blokus.displayTurn = Blokus.board.turn() - 1;

  createPieces();
  createOpponentsPieces();
  updateBoardView();
  updateRecord();

  // update scoreboard
  var names = ['Player', 'Computer'];
  document.getElementById('violet-name').innerHTML = names[Blokus.player];
  document.getElementById('orange-name').innerHTML = names[Blokus.player ^ 1];
  document.getElementById('violet-score').innerHTML =
    Blokus.board.score(0) + ' points';
  document.getElementById('orange-score').innerHTML =
    Blokus.board.score(1) + ' points';
}

// utility functions for cross-browser support

function getStyle(elem) {
  if (typeof elem == 'string')
    elem = document.getElementById(elem);
  if (elem.currentStyle)
    return elem.currentStyle;
  else
    return window.getComputedStyle(elem, null);
}

function getEvent(e) {
  if (!e)
    e = window.event;
  if (!e.stopPropagation)
    e.stopPropagation = function() { this.cancelBubble = true; }
  if (!e.preventDefault)
    e.preventDefault = function() { this.returnValue = false; }
  return e;
}
