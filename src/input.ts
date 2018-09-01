import { Move } from './move.js';
import { blockSet } from './piece.js';
import { Board } from './board.js';
import { SCALE, piecePositionTable } from './view.js';

interface PieceElement extends HTMLElement {
  blockId: number;
  direction: number;
  lastClientX: number;
  lastClientY: number;
}

export const mqFullsize = window.matchMedia('(min-width: 580px)');

export class Input {
  private touchDragHandler: (e: TouchEvent) => void;

  constructor(private board: Board, private player: number, private onPlayerMove: (move: Move) => void) {
    this.touchDragHandler = this.touchDrag.bind(this);
  }

  rotate(elem: PieceElement, dir: number | 'left' | 'right' | 'flip' | 'cyclic', x?: number, y?: number) {
    function setClass(name: string) {
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
      let child = elem.childNodes[i] as HTMLElement;
      child.style.left = rot.coords[i].x * SCALE + 'px';
      child.style.top = rot.coords[i].y * SCALE + 'px';
    }
    if (x != undefined) {
      elem.style.left = x - SCALE / 2 + 'px';
      elem.style.top = y - SCALE / 2 + 'px';
    }
  }

  toBoardPosition(x: number, y: number) {
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

  fromBoardPosition(pos: {x: number, y: number}) {
    let boardStyle = window.getComputedStyle(document.getElementById('board'));
    return {
      x: pos.x * SCALE + parseInt(boardStyle.left) +
        parseInt(boardStyle.borderLeftWidth),
      y: pos.y * SCALE + parseInt(boardStyle.top) +
        parseInt(boardStyle.borderTopWidth)
    };
  }

  createPiece(x: number, y: number, id: number, dir: number) {
    let elem = document.getElementById('b' + id) as PieceElement;
    if (elem) {
      elem.style.left = x + 'px';
      elem.style.top = y + 'px';
      this.rotate(elem, dir);
      return;
    }

    // create a new piece
    elem = document.createElement('div') as any;
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
      elem.onmousedown = this.mouseDrag.bind(this);
      if (elem.addEventListener)
        elem.addEventListener('touchstart', this.touchDrag.bind(this), false);

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
  private wheel_lock: boolean;
  wheel(e: WheelEvent) {
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
      this.rotate(e.currentTarget as PieceElement, 'left', x, y);
    else
      this.rotate(e.currentTarget as PieceElement, 'right', x, y);
  }

  // For compact mode
  private selected: PieceElement;
  select(e: MouseEvent) {
    if (this.board.player() != this.player)
      return;
    let elem = e.currentTarget as PieceElement;
    if (this.selected && this.selected !== elem) {
      this.unselect();
    }
    this.selected = elem;
    elem.classList.remove('unselected');
    elem.classList.add('selected');
    elem.style.left = '155px';
    elem.style.top = '305px';
    elem.onclick = this.click.bind(this);
    elem.addEventListener('touchstart', this.touchDragHandler, false);
  }

  // For compact mode
  unselect() {
    if (!this.selected)
      return;
    this.selected.classList.remove('selected');
    this.selected.classList.add('unselected');
    this.selected.onclick = this.select.bind(this);
    this.selected.removeEventListener('touchstart', this.touchDragHandler, false);
    this.selected = null;
    this.createPieces();
  }

  click(e: MouseEvent) {
    if (mqFullsize.matches && !e.shiftKey) // handle only shift+click
      return;

    if (this.board.player() != this.player)
      return;

    let {x, y} = containerOffset(e);
    this.rotate(e.currentTarget as PieceElement, mqFullsize.matches ? 'right' : 'cyclic', x, y);
  }

  // For full-size mode
  dblclick(e: MouseEvent) {
    if (e.shiftKey) // do not handle shift+dblclick
      return;

    if (this.board.player() != this.player)
      return;

    let {x, y} = containerOffset(e);
    this.rotate(e.currentTarget as PieceElement, 'flip', x, y);
  }

  mouseDrag(e: MouseEvent) {
    if (this.board.player() != this.player)
      return;
    this.dragCommon(e, e.clientX, e.clientY);
  }

  touchDrag(e: TouchEvent) {
    if (this.board.player() != this.player)
      return;
    if (e.targetTouches.length != 1)
      return;
    let clientX = e.targetTouches[0].clientX;
    let clientY = e.targetTouches[0].clientY;
    this.dragCommon(e, clientX, clientY);
  }

  dragCommon(e: TouchEvent | MouseEvent, clientX: number, clientY: number) {
    let elem = e.currentTarget as PieceElement;
    let deltaX = clientX - elem.offsetLeft;
    let deltaY = clientY - elem.offsetTop;
    let touchClick = true;

    if (!mqFullsize.matches) {
      var touchTime = new Date().getTime();
      elem.lastClientX = elem.lastClientY = null;
    }

    elem.classList.add('dragging');

    e.stopPropagation();
    e.preventDefault();

    let moveHandler = (e: Event, clientX: number, clientY: number) => {
      e.stopPropagation();
      let x = clientX - deltaX;
      let y = clientY - deltaY;
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
    let mouseMove = (e: MouseEvent) => {
      moveHandler(e, e.clientX, e.clientY);
    };
    let touchMove = (e: TouchEvent) => {
      if (e.targetTouches.length != 1)
        return;
      let clientX = e.targetTouches[0].clientX;
      let clientY = e.targetTouches[0].clientY;
      elem.lastClientX = clientX;
      elem.lastClientY = clientY;
      touchClick = false;
      moveHandler(e, clientX, clientY);
    };

    let upHandler = (e: Event, clientX: number, clientY: number) => {
      document.removeEventListener('mouseup', mouseUp, true);
      document.removeEventListener('mousemove', mouseMove, true);
      elem.removeEventListener('touchend', touchEnd, false);
      elem.removeEventListener('touchmove', touchMove, false);
      e.stopPropagation();
      if (!mqFullsize.matches)
        elem.classList.remove('dragging');

      let bpos = this.toBoardPosition(clientX - deltaX, clientY - deltaY);
      if (bpos) {
        let move = new Move(bpos.x, bpos.y,
                            elem.blockId << 3 | elem.direction);
        if (this.board.isValidMove(move)) {
          elem.style.visibility = 'hidden';
          this.onPlayerMove(move);
        }
      } else if (!mqFullsize.matches && clientX && clientY) {
        let x = clientX - deltaX;
        let y = clientY - deltaY;
        if (x < 20 || x > 280 || y < 10 || y > 340)
          this.unselect();
      }
    };
    let mouseUp = (e: MouseEvent) => {
      upHandler(e, e.clientX, e.clientY);
    };
    let touchEnd = (e: TouchEvent) => {
      if (e.targetTouches.length > 0)
        return;
      let clientX = elem.lastClientX;
      let clientY = elem.lastClientY;

      if (touchClick) {
        this.rotate(elem, 'cyclic');
      } else if (!mqFullsize.matches) {
        let elapsed = new Date().getTime() - touchTime;
        if (elapsed < 100)
          this.rotate(elem, 'cyclic');
      }
      upHandler(e, clientX, clientY);
    };
    document.addEventListener('mousemove', mouseMove, true);
    document.addEventListener('mouseup', mouseUp, true);
    elem.addEventListener('touchmove', touchMove, false);
    elem.addEventListener('touchend', touchEnd, false);
  }
}

function containerOffset(e: MouseEvent) {
  let offsetParent = (e.currentTarget as HTMLElement).offsetParent as HTMLElement;
  let x = e.pageX - offsetParent.offsetLeft;
  let y = e.pageY - offsetParent.offsetTop;
  return {x, y};
}

// For IE
if (!(window as any).TouchEvent) {
  (window as any).TouchEvent = function() {};
}