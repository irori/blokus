var scale = 20;

function showMessage(msg) {
  var elem = document.getElementById('message');
  elem.innerHTML = msg;
  elem.style.visibility = 'visible';
}

function hideMessage() {
  document.getElementById('message').style.visibility = 'hidden';
}

function setActiveArea() {
  var p = Blokus.board.player() ^ Blokus.player;
  var classes = ['active-area', 'inactive-area'];
  document.getElementById('piece-area').className = classes[p];
  document.getElementById('opponents-piece-area').className = classes[1 - p];

  document.getElementById('pieces').className = (p == 0) ? 'active' : '';
}

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
    elem.childNodes[i].style.left = rot.coords[i].x * scale + 'px';
    elem.childNodes[i].style.top = rot.coords[i].y * scale + 'px';
  }
  if (x != undefined) {
    elem.style.left = x - scale / 2 + 'px';
    elem.style.top = y - scale / 2 + 'px';
  }
}

function toBoardPosition(x, y) {
  var boardStyle = getStyle('board');
  x -= parseInt(boardStyle.left) + parseInt(boardStyle.borderLeftWidth);
  y -= parseInt(boardStyle.top) + parseInt(boardStyle.borderTopWidth);
  x = Math.round(x / scale);
  y = Math.round(y / scale);
  if (Blokus.board.inBounds(x, y))
    return {x: x, y: y};
  else
    return null;
}

function fromBoardPosition(pos) {
  var boardStyle = getStyle('board');
  return {
    x: pos.x * scale + parseInt(boardStyle.left) +
      parseInt(boardStyle.borderLeftWidth),
    y: pos.y * scale + parseInt(boardStyle.top) +
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
                      'left:' + piece.coords[i].x * scale + 'px;' +
                      'top:' + piece.coords[i].y * scale + 'px;' +
                      'width:' + scale + 'px;' +
                      'height:' + scale + 'px;');
    cell.className = 'block' + Blokus.player;
    elem.appendChild(cell);
  }

  // set event handlers
  elem.onmousedown = drag;
  if (elem.addEventListener) {
    elem.addEventListener('touchstart', drag, false);
    elem.addEventListener('gesturestart', gesture, false);
  }
  elem.onclick = click;
  elem.ondblclick = dblclick;
  elem.onmousewheel = wheel;
  if (elem.addEventListener)
    elem.addEventListener('DOMMouseScroll', wheel, false);  // for FF

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
  var area = getStyle('piece-area');
  var left = parseInt(area.left) + parseInt(area.paddingLeft);
  var top = parseInt(area.top) + parseInt(area.paddingTop);
  for (var i = 0; i < piecePositionTable.length; i++) {
    var a = piecePositionTable[i];
    if (!Blokus.board.isUsed(Blokus.player, i))
      createPiece(left + a[0] * scale, top + a[1] * scale, i, a[2]);
  }
}

function createOpponentsPieces() {
  var area = document.getElementById('opponents-pieces');
  for (var id = 0; id < piecePositionTable.length; id++) {
    var a = piecePositionTable[id];
    if (Blokus.board.isUsed(1 - Blokus.player, id))
      continue;

    var x = 9 - a[1];
    var y = a[0];
    var dir = (a[2] + 2) & 7;
    var s = scale >> 1;
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
    area.appendChild(elem);
  }
}

function updateBoardView() {
  var boardElem = document.getElementById('board');
  for (var y = 0; y < 14; y++) {
    for (var x = 0; x < 14; x++) {
      var sq = Blokus.board.at(x, y);
      if ((sq & (Board.VIOLET_BLOCK | Board.ORANGE_BLOCK)) == 0)
        continue;
      var id = 'board_' + x.toString(16) + y.toString(16);
      if (document.getElementById(id))
        continue;
      var cell = document.createElement('div');
      cell.id = id;
      cell.setAttribute('style',
                        'position:absolute;' +
                        'left:' + x * scale + 'px;' +
                        'top:' + y * scale + 'px;' +
                        'width:' + scale + 'px;' +
                        'height:' + scale + 'px;');
      cell.className = (sq & Board.VIOLET_BLOCK) ? 'block0' : 'block1';
      boardElem.appendChild(cell);
    }
  }
}

function updateScore() {
  document.getElementById('violet-score').innerHTML =
    Blokus.board.violetScore() + ' points';
  document.getElementById('orange-score').innerHTML =
    Blokus.board.orangeScore() + ' points';
}

function opponentMove() {
  setActiveArea();
  showMessage(['Orange', 'Violet'][Blokus.player] + ' plays');

  var request = new window.XMLHttpRequest();
  request.open('GET', '/b/hm5move?l=' + Blokus.level +
               '&b=' + Blokus.board.getPath());
  request.onreadystatechange = function() {
    if (request.readyState != 4)
      return;
    if (request.status != 200)
      throw new Error('status: ' + request.status);
    var move = new Move(request.responseText);
    Blokus.board.doMove(move);
    if (!move.isPass())
      document.getElementById('o' + move.blockId()).style.visibility = 'hidden';
    hideMessage();
    updateBoardView();
    updateScore();
    createPieces();
    setActiveArea();
    window.location.replace('#' + Blokus.board.getPath());
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
  request.send(null);
}

function gameEnd() {
  var vscore = Blokus.board.violetScore();
  var oscore = Blokus.board.orangeScore();
  if (vscore > oscore)
    showMessage(document.getElementById('violet-name').innerHTML + ' win');
  else if (vscore < oscore)
    showMessage(document.getElementById('orange-name').innerHTML + ' win');
  else
    showMessage('Draw');
}

function createBoard(state) {
  var board = new Board();
  if (state) {
    var moves = state.split('/');
    for (var i = 0; i < moves.length; i++) {
      if (!moves[i])
        continue;
      var move = new Move(moves[i]);
      if (board.isValidMove(move))
        board.doMove(move);
      else
        throw new Error('invalid move: ' + moves[i]);
    }
  }
  return board;
}

Blokus = { level: 1 };

function initBlokus(path) {
  Blokus.board = createBoard(path);
  if (Blokus.player == undefined)
    Blokus.player = Blokus.board.player();

  var names = ['You', 'Computer'];
  document.getElementById('violet-name').innerHTML = names[Blokus.player];
  document.getElementById('orange-name').innerHTML = names[Blokus.player ^ 1];

  createPieces();
  createOpponentsPieces();
  updateBoardView();
  updateScore();
  setActiveArea();
}

function init() {
  var path = window.location.hash.substring(1);
  if (path) {
    document.getElementById('start-game').style.visibility = 'hidden';
    initBlokus(path);
  }
}

function startGame(player) {
  document.getElementById('start-game').style.visibility = 'hidden';
  Blokus.player = player;
  initBlokus();
  if (player == 1)
    opponentMove();
}

function setLevel(lv) {
  Blokus.level = lv;
}

// event handlers

function wheel(e) {
  e = getEvent(e);

  if (Blokus.board.player() != Blokus.player)
    return;
  var raw = e.detail ? e.detail : -e.wheelDelta;
  var x = e.clientX + getHScroll();
  var y = e.clientY + getVScroll();
  if (raw < 0)
    rotate(this, 'left', x, y);
  else
    rotate(this, 'right', x, y);
  e.stopPropagation();
  e.preventDefault();
}

function click(e) {
  e = getEvent(e);
  if (!e.shiftKey) // handle only shift+click
    return;

  if (Blokus.board.player() != Blokus.player)
    return;

  var x = e.clientX + getHScroll();
  var y = e.clientY + getVScroll();
  rotate(this, 'right', x, y);
}

function dblclick(e) {
  e = getEvent(e);
  if (e.shiftKey) // do not handle shift+dblclick
    return;

  if (Blokus.board.player() != Blokus.player)
    return;

  var x = e.clientX + getHScroll();
  var y = e.clientY + getVScroll();
  rotate(this, 'flip', x, y);
}

function drag(e) {
  e = getEvent(e);

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

  if (document.addEventListener) {
    document.addEventListener('mousemove', moveHandler, true);
    document.addEventListener('mouseup', upHandler, true);
    elem.addEventListener('touchmove', moveHandler, false);
    elem.addEventListener('touchend', upHandler, false);
  }
  else { // for IE
    elem.setCapture();
    elem.attachEvent('onmousemove', moveHandler);
    elem.attachEvent('onmouseup', upHandler);
    elem.attachEvent('onlosecapture', upHandler);
  }

  e.stopPropagation();
  e.preventDefault();

  function moveHandler(e) {
    e = getEvent(e);

    if (e.targetTouches) {
      if (e.targetTouches.length != 1)
        return;
      e.clientX = e.targetTouches[0].clientX;
      e.clientY = e.targetTouches[0].clientY;
      this.lastClientX = e.clientX;
      this.lastClientY = e.clientY;
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
    e = getEvent(e);

    if (e.targetTouches) {
      if (e.targetTouches.length > 0)
        return;
      e.clientX = this.lastClientX;
      e.clientY = this.lastClientY;

      var now = new Date().getTime();
      if (this.lastTouch && now - this.lastTouch < 400)
        rotate(elem, 'flip');
      this.lastTouch = now;
    }

    if (document.removeEventListener) {
      document.removeEventListener('mouseup', upHandler, true);
      document.removeEventListener('mousemove', moveHandler, true);
      elem.removeEventListener('touchend', upHandler, false);
      elem.removeEventListener('touchmove', moveHandler, false);
    }
    else { // for IE
      elem.detachEvent('onlosecapture', upHandler);
      elem.detachEvent('onmouseup', upHandler);
      elem.detachEvent('onmousemove', moveHandler);
      elem.releaseCapture();
    }
    e.stopPropagation();

    var bpos = toBoardPosition(e.clientX - deltaX, e.clientY - deltaY);
    if (bpos) {
      var move = new Move(bpos.x, bpos.y,
                          elem.blockId << 3 | elem.direction);
      if (Blokus.board.isValidMove(move)) {
        Blokus.board.doMove(move);
        opponentMove();
        elem.style.visibility = 'hidden';
        updateBoardView();
        updateScore();
      }
    }
  }
}

function gesture(e) {
  if (Blokus.board.player() != Blokus.player)
    return;

  document.addEventListener('gesturechange', gestureChange, true);
  document.addEventListener('gestureend', gestureEnd, true);

  e.stopPropagation();
  e.preventDefault();

  var elem = this;
  elem.rotateBase = 0;

  function gestureChange(e) {
    e.stopPropagation();

    if (e.rotation < elem.rotateBase - 20) {
      elem.rotateBase -= 20;
      rotate(elem, 'left');
    }
    else if (e.rotation > elem.rotateBase + 20) {
      elem.rotateBase += 20;
      rotate(elem, 'right');
    }
  }

  function gestureEnd(e) {
    e.stopPropagation();
    document.removeEventListener('gesturechange', gestureChange, true);
    document.removeEventListener('gestureend', gestureEnd, true);
  }
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

function getHScroll() {
  if (window.pageXOffset !== undefined)
    return window.pageXOffset;
  else
    return document.body.scrollLeft;
}

function getVScroll() {
  if (window.pageYOffset !== undefined)
    return window.pageYOffset;
  else
    return document.documentElement.scrollTop;
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
