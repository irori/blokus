var Blokus = { level: 1 };
var SCALE = 20;

function showMessage(msg) {
  var elem = document.getElementById('message');
  if (typeof msg == 'string')
    elem.innerHTML = msg;
  else {
    elem.innerHTML = '';
    elem.appendChild(msg);
  }
  elem.style.visibility = 'visible';
}

function hideMessage() {
  document.getElementById('message').style.visibility = 'hidden';
}

function rotate(elem, dir, x, y) {
  switch (dir) {
  case 'left':
    dir = (elem.direction + [6, 2][elem.direction & 1]) & 7;
    elem.classList.add('rotate-left');
    setTimeout(function() {elem.classList.remove('rotate-left')}, 0);
    break;
  case 'right':
    dir = (elem.direction + [2, 6][elem.direction & 1]) & 7;
    elem.classList.add('rotate-right');
    setTimeout(function() {elem.classList.remove('rotate-right')}, 0);
    break;
  case 'flip':
    dir = elem.direction ^ 1;
    elem.classList.add('rotate-flip');
    setTimeout(function() {elem.classList.remove('rotate-flip')}, 0);
    break;
  case 'cyclic':
    if (elem.direction == 1 || elem.direction == 6) {
      dir = elem.direction ^ 1;
      elem.classList.add('rotate-flip');
    } else {
      dir = elem.direction + (elem.direction & 1 ? -2 : 2);
      elem.classList.add('rotate-right');
    }
    setTimeout(function() {elem.classList.remove('rotate-flip');
                           elem.classList.remove('rotate-right');}, 16);
    break;
  }
  window.getComputedStyle(elem).transform;  // force style update

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
  var boardStyle = window.getComputedStyle(document.getElementById('board'));
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
  var boardStyle = window.getComputedStyle(document.getElementById('board'));
  return {
    x: pos.x * SCALE + parseInt(boardStyle.left) +
      parseInt(boardStyle.borderLeftWidth),
    y: pos.y * SCALE + parseInt(boardStyle.top) +
      parseInt(boardStyle.borderTopWidth)
  };
}

function createPiece(x, y, id, dir) {
  var elem = document.getElementById('b' + id);
  if (elem) {
    elem.style.left = x + 'px';
    elem.style.top = y + 'px';
    rotate(elem, dir);
    return;
  }

  // create a new piece
  elem = document.createElement('div');
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
  elem.classList.add('piece');
  elem.classList.add('unselected');

  elem.onclick = select;

  document.getElementById('pieces').appendChild(elem);
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
  var area = window.getComputedStyle(document.getElementById('piece-area'));
  var left = parseInt(area.left) + parseInt(area.paddingLeft);
  var top = parseInt(area.top) + parseInt(area.paddingTop);
  for (var i = 0; i < piecePositionTable.length; i++) {
    var a = piecePositionTable[i];
    if (!Blokus.board.isUsed(Blokus.player, i))
      createPiece(left + a[0] * SCALE/2 - SCALE/4, top + a[1] * SCALE/2 - SCALE/4, i, a[2]);
  }
}

function updateBoardView(moveToHighlight) {
  var boardElem = document.getElementById('board');
  var coordsToHighlight = moveToHighlight ? moveToHighlight.coords() : [];
  for (var y = 0; y < 14; y++) {
    for (var x = 0; x < 14; x++) {
      var sq = Blokus.board.at(x, y);
      if ((sq & (Board.VIOLET_BLOCK | Board.ORANGE_BLOCK)) == 0)
        continue;
      var id = 'board_' + x.toString(16) + y.toString(16);

      var cell = document.getElementById(id);
      if (!cell) {
        cell = document.createElement('div');
        cell.id = id;
        cell.setAttribute('style',
                          'position:absolute;' +
                          'left:' + x * SCALE + 'px;' +
                          'top:' + y * SCALE + 'px;' +
                          'width:' + SCALE + 'px;' +
                          'height:' + SCALE + 'px;');
        boardElem.appendChild(cell);
      }
      var cls = (sq & Board.VIOLET_BLOCK) ? 'block0' : 'block1';
      for (var i = 0; i < coordsToHighlight.length; i++) {
        if (coordsToHighlight[i].x == x && coordsToHighlight[i].y == y) {
          cls += 'highlight';
          break;
        }
      }
      cell.className = cls;
    }
  }
}

function opponentMove() {
  showMessage(['Orange', 'Violet'][Blokus.player] + ' plays');
  Blokus.backend.request(Blokus.board.getPath(), Blokus.level);
}

function onOpponentMove(move) {
  Blokus.board.doMove(move);
  hideMessage();
  updateBoardView(move);
  createPieces();
  // window.location.replace('#' + Blokus.board.getPath());
  if (!Blokus.board.canMove()) {
    if (move.isPass())
      gameEnd();
    else {
      Blokus.board.doPass();
      opponentMove();
    }
    return;
  }
}

function gameEnd() {
  var msg = '<span style="color:#63d">' + Blokus.board.score(0) + '</span> - <span style="color:#f72">' + Blokus.board.score(1) + '</span> ';
  var myScore = Blokus.board.score(Blokus.player);
  var yourScore = Blokus.board.score(Blokus.player ^ 1);
  if (myScore > yourScore) {
    msg += 'You win!';
  } else if (myScore < yourScore) {
    msg += 'You lose...';
  } else {
    msg += 'Draw';
  }
  showMessage(msg);
  Blokus.player = null;
}

function startGame() {
  document.getElementById('start-game').style.visibility = 'hidden';
  createPieces();
  updateBoardView();
}

// functions called from blokus.html

function init() {
  var path = window.location.hash.substring(1);
  if (path) {
    Blokus.board = new Board(path);
    Blokus.player = Blokus.board.player();
    Blokus.backend = createBackend(onOpponentMove);
    startGame(path);
  }
}

function startButton(player) {
  Blokus.board = new Board();
  Blokus.player = player;
  Blokus.backend = createBackend(onOpponentMove);
  startGame();
  if (player == 1)
    opponentMove();
}

function setLevel(lv) {
  Blokus.level = lv;
}

// event handlers

function select(e) {
  if (Blokus.board.player() != Blokus.player)
    return;
  if (Blokus.selected && Blokus.selected !== this) {
    unselect();
  }
  Blokus.selected = this;
  this.classList.remove('unselected');
  this.style.left = '155px';
  this.style.top = '305px';
  this.onclick = click;
  this.addEventListener('touchstart', drag, false);
}

function unselect(e) {
  if (!Blokus.selected)
    return;
  Blokus.selected.classList.add('unselected');
  Blokus.selected.classList.remove('rotating');
  Blokus.selected.onclick = select;
  Blokus.selected.removeEventListener('touchstart', drag, false);
  Blokus.selected = null;
  createPieces();
}

function click(e) {
  if (Blokus.board.player() != Blokus.player)
    return;

  var x = e.clientX + window.pageXOffset;
  var y = e.clientY + window.pageYOffset;
  rotate(this, 'cyclic', x, y);
}

function drag(e) {
  if (Blokus.board.player() != Blokus.player)
    return;

  if (e.targetTouches) {
    if (e.targetTouches.length != 1)
      return;
    e.clientX = e.targetTouches[0].clientX;
    e.clientY = e.targetTouches[0].clientY;
  }

  var elem = this;
  var deltaX = e.clientX - this.offsetLeft;
  var deltaY = e.clientY - this.offsetTop;
  var touchClick = true;
  var touchTime = new Date().getTime();
  elem.lastClientX = elem.lastClientY = null;

  elem.addEventListener('touchmove', moveHandler, false);
  elem.addEventListener('touchend', upHandler, false);
  elem.classList.add('dragging');

  e.stopPropagation();
  e.preventDefault();

  function moveHandler(e) {
    if (e.targetTouches) {
      if (e.targetTouches.length != 1)
        return;
      e.clientX = e.targetTouches[0].clientX;
      e.clientY = e.targetTouches[0].clientY;
      this.lastClientX = e.clientX;
      this.lastClientY = e.clientY;
      touchClick = false;
    }

    e.stopPropagation();
    var x = e.clientX - deltaX;
    var y = e.clientY - deltaY;
    var bpos = toBoardPosition(x, y);
    var pieceId = elem.blockId << 3 | elem.direction;
    if (bpos &&
        Blokus.board.isValidMove(new Move(bpos.x, bpos.y, pieceId))) {
      var epos = fromBoardPosition(bpos);
      elem.style.left = epos.x + 'px';
      elem.style.top = epos.y + 'px';
    }
    else {
      elem.style.left = x + 'px';
      elem.style.top = y + 'px';
    }
  }

  function upHandler(e) {
    if (e.targetTouches) {
      if (e.targetTouches.length > 0)
        return;
      e.clientX = this.lastClientX;
      e.clientY = this.lastClientY;

      var elapsed = new Date().getTime() - touchTime;
      if (elapsed < 100 || touchClick)
        rotate(elem, 'cyclic');
    }

    elem.removeEventListener('touchend', upHandler, false);
    elem.removeEventListener('touchmove', moveHandler, false);
    e.stopPropagation();
    elem.classList.remove('dragging');

    var bpos = toBoardPosition(e.clientX - deltaX, e.clientY - deltaY);
    if (bpos) {
      var move = new Move(bpos.x, bpos.y,
                          elem.blockId << 3 | elem.direction);
      if (Blokus.board.isValidMove(move)) {
        Blokus.board.doMove(move);
        opponentMove();
        elem.style.visibility = 'hidden';
        updateBoardView();
      }
    } else if (e.clientX && e.clientY) {
      var x = e.clientX - deltaX;
      var y = e.clientY - deltaY;
      if (x < 20 || x > 280 || y < 10 || y > 340)
        unselect();
    }
  }
}
