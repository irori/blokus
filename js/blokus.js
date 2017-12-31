import { blockSet } from './piece.js'
import { Move, Board } from './board.js'
import { View, SCALE, piecePositionTable } from './view.js'
import Backend from './backend.js'

let Blokus = { level: 1 };
const mqFullsize = window.matchMedia('(min-width: 580px)');

function rotate(elem, dir, x, y) {
  switch (dir) {
  case 'left':
    dir = (elem.direction + [6, 2][elem.direction & 1]) & 7;
    elem.className = 'piece rotate-left';
    setTimeout(() => {elem.className = 'piece rotating'}, 0);
    break;
  case 'right':
    dir = (elem.direction + [2, 6][elem.direction & 1]) & 7;
    elem.className = 'piece rotate-right';
    setTimeout(() => {elem.className = 'piece rotating'}, 0);
    break;
  case 'flip':
    dir = elem.direction ^ 1;
    elem.className = 'piece rotate-flip';
    setTimeout(() => {elem.className = 'piece rotating'}, 0);
    break;
  case 'cyclic':
    if (elem.direction == 1 || elem.direction == 6) {
      dir = elem.direction ^ 1;
      elem.className = 'piece rotate-flip';
    } else {
      dir = elem.direction + (elem.direction & 1 ? -2 : 2);
      elem.className = 'piece rotate-right';
    }
    setTimeout(() => {elem.className = 'piece rotating'}, mqFullsize.matches ? 0 : 16);
    break;
  }
  window.getComputedStyle(elem).transform;  // force style update

  elem.direction = dir;
  let rot = blockSet[elem.blockId].rotations[dir];
  for (let i = 0; i < rot.size; i++) {
    elem.childNodes[i].style.left = rot.coords[i].x * SCALE + 'px';
    elem.childNodes[i].style.top = rot.coords[i].y * SCALE + 'px';
    if (!mqFullsize.matches)
      elem.childNodes[i].style.zIndex = 3 + rot.coords[i].x + rot.coords[i].y;
  }
  if (x != undefined) {
    elem.style.left = x - SCALE / 2 + 'px';
    elem.style.top = y - SCALE / 2 + 'px';
  }
}

function toBoardPosition(x, y) {
  let boardStyle = window.getComputedStyle(document.getElementById('board'));
  x -= parseInt(boardStyle.left) + parseInt(boardStyle.borderLeftWidth);
  y -= parseInt(boardStyle.top) + parseInt(boardStyle.borderTopWidth);
  x = Math.round(x / SCALE);
  y = Math.round(y / SCALE);
  if (Blokus.board.inBounds(x, y))
    return {x, y};
  else
    return null;
}

function fromBoardPosition(pos) {
  let boardStyle = window.getComputedStyle(document.getElementById('board'));
  return {
    x: pos.x * SCALE + parseInt(boardStyle.left) +
      parseInt(boardStyle.borderLeftWidth),
    y: pos.y * SCALE + parseInt(boardStyle.top) +
      parseInt(boardStyle.borderTopWidth)
  };
}

function createPiece(x, y, id, dir) {
  let elem = document.getElementById('b' + id);
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
  let piece = blockSet[id].rotations[dir].piece;
  for (let i = 0; i < piece.size; i++) {
    let cell = document.createElement('div');
    cell.setAttribute('style',
                      'position:absolute;' +
                      'left:' + piece.coords[i].x * SCALE + 'px;' +
                      'top:' + piece.coords[i].y * SCALE + 'px;' +
                      (mqFullsize.matches ? '' : 'z-index:' + (3 + piece.coords[i].x + piece.coords[i].y) + ';') +
                      'width:' + SCALE + 'px;' +
                      'height:' + SCALE + 'px;');
    cell.className = 'block' + Blokus.player;
    elem.appendChild(cell);
  }

  if (mqFullsize.matches) {
    // set event handlers
    elem.onmousedown = drag;
    if (elem.addEventListener)
      elem.addEventListener('touchstart', drag, false);

    elem.onclick = click;
    elem.ondblclick = dblclick;
    elem.onmousewheel = wheel;
    if (elem.addEventListener)
      elem.addEventListener('DOMMouseScroll', wheel, false);  // for FF
  } else {
    elem.classList.add('piece');
    elem.classList.add('unselected');
    elem.onclick = select;
  }
  document.getElementById('pieces').appendChild(elem);
}

function createPieces() {
  let area = window.getComputedStyle(document.getElementById('piece-area'));
  let left = parseInt(area.left) + parseInt(area.paddingLeft);
  let top = parseInt(area.top) + parseInt(area.paddingTop);
  for (let i = 0; i < piecePositionTable.length; i++) {
    let a = piecePositionTable[i];
    if (!Blokus.board.isUsed(Blokus.player, i)) {
      if (mqFullsize.matches)
        createPiece(left + a[0] * SCALE, top + a[1] * SCALE, i, a[2]);
      else
        createPiece(left + a[0] * SCALE/2 - SCALE/4, top + a[1] * SCALE/2 - SCALE/4, i, a[2]);
    }
  }
}

function opponentMove() {
  Blokus.view.startOpponentMove();
  Blokus.backend.request(Blokus.board.getPath(), Blokus.level);
}

function onOpponentMove(move) {
  Blokus.board.doMove(move);
  Blokus.view.onOpponentMove(move);
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
  Blokus.view.gameEnd(!mqFullsize.matches);
  if (!mqFullsize.matches)
    Blokus.player = null;
}

function startGame() {
  if (mqFullsize.matches) {
    let names = ['You', 'Computer'];
    document.getElementById('violet-name').innerHTML = names[Blokus.player];
    document.getElementById('orange-name').innerHTML = names[Blokus.player ^ 1];
  }
  document.getElementById('start-game').style.visibility = 'hidden';
  createPieces();
  Blokus.view.startGame();
}

// Event handlers

window.addEventListener('load', () => {
  let path = window.location.hash.substring(1);
  if (path) {
    Blokus.board = new Board(path);
    Blokus.player = Blokus.board.player();
    Blokus.view = new View(Blokus.board, Blokus.player);
    Blokus.backend = new Backend(onOpponentMove);
    startGame(path);
  }
});

function startButton(player) {
  Blokus.board = new Board();
  Blokus.player = player;
  Blokus.view = new View(Blokus.board, player);
  Blokus.backend = new Backend(onOpponentMove);
  startGame();
  if (player == 1)
    opponentMove();
}
document.getElementById('start-violet').addEventListener('click', () => startButton(0));
document.getElementById('start-orange').addEventListener('click', () => startButton(1));

function setLevel(lv) {
  Blokus.level = lv;
}
document.getElementById('level1').addEventListener('click', () => setLevel(1));
document.getElementById('level2').addEventListener('click', () => setLevel(2));
document.getElementById('level3').addEventListener('click', () => setLevel(3));

// event handlers

// For full-size mode
function wheel(e) {
  e.stopPropagation();
  e.preventDefault();

  if (wheel.lock)
    return;
  wheel.lock = true;
  setTimeout(() => {wheel.lock = false}, 50);

  if (Blokus.board.player() != Blokus.player)
    return;
  let raw = e.detail ? e.detail : -e.wheelDelta;
  let x = e.clientX + window.pageXOffset;
  let y = e.clientY + window.pageYOffset;
  if (raw < 0)
    rotate(this, 'left', x, y);
  else
    rotate(this, 'right', x, y);
}

// For compact mode
function select() {
  if (Blokus.board.player() != Blokus.player)
    return;
  if (Blokus.selected && Blokus.selected !== this) {
    unselect();
  }
  Blokus.selected = this;
  this.classList.remove('unselected');
  this.classList.add('selected');
  this.style.left = '155px';
  this.style.top = '305px';
  this.onclick = click;
  this.addEventListener('touchstart', drag, false);
}

// For compact mode
function unselect() {
  if (!Blokus.selected)
    return;
  Blokus.selected.classList.remove('selected');
  Blokus.selected.classList.add('unselected');
  Blokus.selected.classList.remove('rotating');
  Blokus.selected.onclick = select;
  Blokus.selected.removeEventListener('touchstart', drag, false);
  Blokus.selected = null;
  createPieces();
}

function click(e) {
  if (mqFullsize.matches && !e.shiftKey) // handle only shift+click
    return;

  if (Blokus.board.player() != Blokus.player)
    return;

  let x = e.clientX + window.pageXOffset;
  let y = e.clientY + window.pageYOffset;
  rotate(this, mqFullsize.match ? 'right' : 'cyclic', x, y);
}

// For full-size mode
function dblclick(e) {
  if (e.shiftKey) // do not handle shift+dblclick
    return;

  if (Blokus.board.player() != Blokus.player)
    return;

  let x = e.clientX + window.pageXOffset;
  let y = e.clientY + window.pageYOffset;
  rotate(this, 'flip', x, y);
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

  let elem = this;
  let deltaX = e.clientX - this.offsetLeft;
  let deltaY = e.clientY - this.offsetTop;
  let touchClick = true;

  if (mqFullsize.matches) {
    document.addEventListener('mousemove', moveHandler, true);
    document.addEventListener('mouseup', upHandler, true);
  } else {
    var touchTime = new Date().getTime();
    elem.lastClientX = elem.lastClientY = null;
  }

  elem.addEventListener('touchmove', moveHandler, false);
  elem.addEventListener('touchend', upHandler, false);
  if (!mqFullsize.matches)
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
    let x = e.clientX - deltaX;
    let y = e.clientY - deltaY;
    let bpos = toBoardPosition(x, y);
    let pieceId = elem.blockId << 3 | elem.direction;
    if (bpos &&
        Blokus.board.isValidMove(new Move(bpos.x, bpos.y, pieceId))) {
      let epos = fromBoardPosition(bpos);
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

      if (touchClick) {
        rotate(elem, 'cyclic');
      } else if (!mqFullsize.matches) {
        let elapsed = new Date().getTime() - touchTime;
        if (elapsed < 100)
          rotate(elem, 'cyclic');
      }
    }

    if (mqFullsize.matches) {
      document.removeEventListener('mouseup', upHandler, true);
      document.removeEventListener('mousemove', moveHandler, true);
    }
    elem.removeEventListener('touchend', upHandler, false);
    elem.removeEventListener('touchmove', moveHandler, false);
    e.stopPropagation();
    if (!mqFullsize.matches)
      elem.classList.remove('dragging');

    let bpos = toBoardPosition(e.clientX - deltaX, e.clientY - deltaY);
    if (bpos) {
      let move = new Move(bpos.x, bpos.y,
                          elem.blockId << 3 | elem.direction);
      if (Blokus.board.isValidMove(move)) {
        Blokus.board.doMove(move);
        opponentMove();
        elem.style.visibility = 'hidden';
        Blokus.view.onPlayerMove();
      }
    } else if (!mqFullsize.matches && e.clientX && e.clientY) {
      let x = e.clientX - deltaX;
      let y = e.clientY - deltaY;
      if (x < 20 || x > 280 || y < 10 || y > 340)
        unselect();
    }
  }
}
