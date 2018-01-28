import { Move } from './move.js'
import { blockSet } from './piece.js'
import { SCALE, piecePositionTable } from './view.js'

export const mqFullsize = window.matchMedia('(min-width: 580px)');

export class Input {
  constructor(board, player, onPlayerMove) {
    this.board = board;
    this.player = player;
    this.onPlayerMove = onPlayerMove;
    this.dragHandler = this.drag.bind(this);
  }

  rotate(elem, dir, x, y) {
    function setClass(name) {
      elem.classList.add(name);
      setTimeout(() => elem.classList.remove(name), 16);
    }
    switch (dir) {
    case 'left':
      dir = (elem.direction + [6, 2][elem.direction & 1]) & 7;
      setClass('rotate-left');
      break;
    case 'right':
      dir = (elem.direction + [2, 6][elem.direction & 1]) & 7;
      setClass('rotate-right');
      break;
    case 'flip':
      dir = elem.direction ^ 1;
      setClass('rotate-flip');
      break;
    case 'cyclic':
      if (elem.direction == 1 || elem.direction == 6) {
        dir = elem.direction ^ 1;
        setClass('rotate-flip');
      } else {
        dir = elem.direction + (elem.direction & 1 ? -2 : 2);
        setClass('rotate-right');
      }
      break;
    }

    elem.direction = dir;
    let rot = blockSet[elem.blockId].rotations[dir];
    for (let i = 0; i < rot.size; i++) {
      elem.childNodes[i].style.left = rot.coords[i].x * SCALE + 'px';
      elem.childNodes[i].style.top = rot.coords[i].y * SCALE + 'px';
    }
    if (x != undefined) {
      elem.style.left = x - SCALE / 2 + 'px';
      elem.style.top = y - SCALE / 2 + 'px';
    }
  }

  toBoardPosition(x, y) {
    let boardStyle = window.getComputedStyle(document.getElementById('board'));
    x -= parseInt(boardStyle.left) + parseInt(boardStyle.borderLeftWidth);
    y -= parseInt(boardStyle.top) + parseInt(boardStyle.borderTopWidth);
    x = Math.round(x / SCALE);
    y = Math.round(y / SCALE);
    if (this.board.inBounds(x, y))
      return {x, y};
    else
      return null;
  }

  fromBoardPosition(pos) {
    let boardStyle = window.getComputedStyle(document.getElementById('board'));
    return {
      x: pos.x * SCALE + parseInt(boardStyle.left) +
        parseInt(boardStyle.borderLeftWidth),
      y: pos.y * SCALE + parseInt(boardStyle.top) +
        parseInt(boardStyle.borderTopWidth)
    };
  }

  createPiece(x, y, id, dir) {
    let elem = document.getElementById('b' + id);
    if (elem) {
      elem.style.left = x + 'px';
      elem.style.top = y + 'px';
      this.rotate(elem, dir);
      return;
    }

    // create a new piece
    elem = document.createElement('div');
    elem.id = 'b' + id;
    elem.blockId = id;
    elem.direction = dir;
    elem.classList.add('piece');
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
                        'width:' + SCALE + 'px;' +
                        'height:' + SCALE + 'px;');
      cell.className = 'block' + this.player;
      elem.appendChild(cell);
    }

    if (mqFullsize.matches) {
      // set event handlers
      elem.onmousedown = this.drag.bind(this);
      if (elem.addEventListener)
        elem.addEventListener('touchstart', this.drag.bind(this), false);

      elem.onclick = this.click.bind(this);
      elem.ondblclick = this.dblclick.bind(this);
      elem.onmousewheel = this.wheel.bind(this);
      if (elem.addEventListener)
        elem.addEventListener('DOMMouseScroll', this.wheel.bind(this), false);  // for FF
    } else {
      elem.classList.add('unselected');
      elem.onclick = this.select.bind(this);
    }
    document.getElementById('pieces').appendChild(elem);
  }

  createPieces() {
    let area = window.getComputedStyle(document.getElementById('piece-area'));
    let left = parseInt(area.left) + parseInt(area.paddingLeft);
    let top = parseInt(area.top) + parseInt(area.paddingTop);
    for (let i = 0; i < piecePositionTable.length; i++) {
      let a = piecePositionTable[i];
      if (!this.board.isUsed(this.player, i)) {
        if (mqFullsize.matches)
          this.createPiece(left + a[0] * SCALE, top + a[1] * SCALE, i, a[2]);
        else
          this.createPiece(left + a[0] * SCALE/2 - SCALE/4, top + a[1] * SCALE/2 - SCALE/4, i, a[2]);
      }
    }
  }

  // For full-size mode
  wheel(e) {
    e.stopPropagation();
    e.preventDefault();

    if (this.wheel_lock)
      return;
    this.wheel_lock = true;
    setTimeout(() => {this.wheel_lock = false}, 50);

    if (this.board.player() != this.player)
      return;
    let raw = e.detail ? e.detail : -e.wheelDelta;
    let {x, y} = containerOffset(e);
    if (raw < 0)
      this.rotate(e.currentTarget, 'left', x, y);
    else
      this.rotate(e.currentTarget, 'right', x, y);
  }

  // For compact mode
  select(e) {
    if (this.board.player() != this.player)
      return;
    if (this.selected && this.selected !== this) {
      this.unselect();
    }
    let elem = e.currentTarget;
    this.selected = elem;
    elem.classList.remove('unselected');
    elem.classList.add('selected');
    elem.style.left = '155px';
    elem.style.top = '305px';
    elem.onclick = this.click.bind(this);
    elem.addEventListener('touchstart', this.dragHandler, false);
  }

  // For compact mode
  unselect() {
    if (!this.selected)
      return;
    this.selected.classList.remove('selected');
    this.selected.classList.add('unselected');
    this.selected.onclick = this.select.bind(this);
    this.selected.removeEventListener('touchstart', this.dragHandler, false);
    this.selected = null;
    this.createPieces();
  }

  click(e) {
    if (mqFullsize.matches && !e.shiftKey) // handle only shift+click
      return;

    if (this.board.player() != this.player)
      return;

    let {x, y} = containerOffset(e);
    this.rotate(e.currentTarget, mqFullsize.match ? 'right' : 'cyclic', x, y);
  }

  // For full-size mode
  dblclick(e) {
    if (e.shiftKey) // do not handle shift+dblclick
      return;

    if (this.board.player() != this.player)
      return;

    let {x, y} = containerOffset(e);
    this.rotate(e.currentTarget, 'flip', x, y);
  }

  drag(e) {
    if (this.board.player() != this.player)
      return;

    if (e.targetTouches) {
      if (e.targetTouches.length != 1)
        return;
      e.clientX = e.targetTouches[0].clientX;
      e.clientY = e.targetTouches[0].clientY;
    }

    let elem = e.currentTarget;
    let deltaX = e.clientX - elem.offsetLeft;
    let deltaY = e.clientY - elem.offsetTop;
    let touchClick = true;

    if (!mqFullsize.matches) {
      var touchTime = new Date().getTime();
      elem.lastClientX = elem.lastClientY = null;
    }

    elem.classList.add('dragging');

    e.stopPropagation();
    e.preventDefault();

    let moveHandler = (e) => {
      if (e.targetTouches) {
        if (e.targetTouches.length != 1)
          return;
        e.clientX = e.targetTouches[0].clientX;
        e.clientY = e.targetTouches[0].clientY;
        elem.lastClientX = e.clientX;
        elem.lastClientY = e.clientY;
        touchClick = false;
      }

      e.stopPropagation();
      let x = e.clientX - deltaX;
      let y = e.clientY - deltaY;
      let bpos = this.toBoardPosition(x, y);
      let pieceId = elem.blockId << 3 | elem.direction;
      if (bpos &&
          this.board.isValidMove(new Move(bpos.x, bpos.y, pieceId))) {
        let epos = this.fromBoardPosition(bpos);
        elem.style.left = epos.x + 'px';
        elem.style.top = epos.y + 'px';
      }
      else {
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
      }
    };

    let upHandler = (e) => {
      if (e.targetTouches) {
        if (e.targetTouches.length > 0)
          return;
        e.clientX = elem.lastClientX;
        e.clientY = elem.lastClientY;

        if (touchClick) {
          this.rotate(elem, 'cyclic');
        } else if (!mqFullsize.matches) {
          let elapsed = new Date().getTime() - touchTime;
          if (elapsed < 100)
            this.rotate(elem, 'cyclic');
        }
      }

      document.removeEventListener('mouseup', upHandler, true);
      document.removeEventListener('mousemove', moveHandler, true);
      elem.removeEventListener('touchend', upHandler, false);
      elem.removeEventListener('touchmove', moveHandler, false);
      e.stopPropagation();
      if (!mqFullsize.matches)
        elem.classList.remove('dragging');

      let bpos = this.toBoardPosition(e.clientX - deltaX, e.clientY - deltaY);
      if (bpos) {
        let move = new Move(bpos.x, bpos.y,
                            elem.blockId << 3 | elem.direction);
        if (this.board.isValidMove(move)) {
          elem.style.visibility = 'hidden';
          this.onPlayerMove(move);
        }
      } else if (!mqFullsize.matches && e.clientX && e.clientY) {
        let x = e.clientX - deltaX;
        let y = e.clientY - deltaY;
        if (x < 20 || x > 280 || y < 10 || y > 340)
          this.unselect();
      }
    };
    document.addEventListener('mousemove', moveHandler, true);
    document.addEventListener('mouseup', upHandler, true);
    elem.addEventListener('touchmove', moveHandler, false);
    elem.addEventListener('touchend', upHandler, false);
  }
}

function containerOffset(e) {
  let x = e.pageX - e.currentTarget.offsetParent.offsetLeft;
  let y = e.pageY - e.currentTarget.offsetParent.offsetTop;
  return {x, y};
}
