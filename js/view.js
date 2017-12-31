import { blockSet } from './piece.js'

export const SCALE = 20;
export const piecePositionTable = [ // x, y, dir
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

export class View {
  constructor(board, player) {
    this.board = board;
    this.player = player;
  }

  startGame() {
    this.createOpponentsPieces();
    this.update();
    this.setActiveArea();
    this.elapsed = [0, 0];
    this.timer = setInterval(this.timerHandler.bind(this), 1000);
  }

  gameEnd(shouldShowScore) {
    this.showGameEndMessage(shouldShowScore);
    clearInterval(this.timer);
  }

  onPlayerMove() {
    this.update();
  }

  startOpponentMove() {
    this.setActiveArea();
    this.showOpponentsPlaying(true);
  }

  onOpponentMove(move) {
    this.hideOpponentsPiece(move);
    this.showOpponentsPlaying(false);
    this.update(move);
    this.setActiveArea();
  }

  timerHandler() {
    function formatTime(t) {
      let m = Math.floor(t / 60), s = t % 60;
      return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    this.elapsed[this.board.player()]++;
    document.getElementById('violet-time').innerHTML = formatTime(this.elapsed[0]);
    document.getElementById('orange-time').innerHTML = formatTime(this.elapsed[1]);
  }

  createOpponentsPieces() {
    let area = document.getElementById('opponents-pieces');
    for (let id = 0; id < piecePositionTable.length; id++) {
      let a = piecePositionTable[id];
      if (this.board.isUsed(1 - this.player, id))
        continue;

      let x = 9 - a[1];
      let y = a[0];
      let dir = (a[2] + 2) & 7;
      let s = SCALE >> 1;
      let piece = blockSet[id].rotations[dir];

      let elem = document.createElement('div');
      elem.id = 'o' + id;
      elem.setAttribute('style',
                        'left:' + x * s + 'px;' +
                        'top:' + y * s + 'px;' +
                        'position:absolute;');
      for (let i = 0; i < piece.size; i++) {
        let cell = document.createElement('div');
        cell.setAttribute('style',
                          'position:absolute;' +
                          'left:' + piece.coords[i].x * s + 'px;' +
                          'top:' + piece.coords[i].y * s + 'px;' +
                          'width:' + s + 'px;' +
                          'height:' + s + 'px;');
        cell.className = 'block' + (1 - this.player);
        elem.appendChild(cell);
      }
      area.appendChild(elem);
    }
  }

  hideOpponentsPiece(move) {
    if (!move.isPass())
      document.getElementById('o' + move.blockId()).style.visibility = 'hidden';
  }

  updateBoard(moveToHighlight) {
    let boardElem = document.getElementById('board');
    let coordsToHighlight = moveToHighlight ? moveToHighlight.coords() : [];
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        let col = this.board.colorAt(x, y);
        if (!col)
        continue;
        let id = 'board_' + x.toString(16) + y.toString(16);

        let cell = document.getElementById(id);
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
        let cls = {violet: 'block0', orange: 'block1'}[col];
        for (let i = 0; i < coordsToHighlight.length; i++) {
          if (coordsToHighlight[i].x == x && coordsToHighlight[i].y == y) {
            cls += 'highlight';
            break;
          }
        }
        cell.className = cls;
      }
    }
  }

  updateScore() {
    document.getElementById('violet-score').innerHTML =
      this.board.score(0) + ' points';
    document.getElementById('orange-score').innerHTML =
      this.board.score(1) + ' points';
  }

  update(moveToHighlight) {
    this.updateBoard(moveToHighlight);
    this.updateScore();
  }

  setActiveArea() {
    let p = this.board.player() ^ this.player;
    let classes = ['active-area', 'inactive-area'];
    document.getElementById('piece-area').className = classes[p];
    document.getElementById('opponents-piece-area').className = classes[1 - p];

    document.getElementById('pieces').className = (p == 0) ? 'active' : '';
  }

  showOpponentsPlaying(show) {
    if (show)
      this.showMessage(['Orange', 'Violet'][this.player] + ' plays');
    else
      this.hideMessage();
  }

  showGameEndMessage(shouldShowScore) {
    let msg = '';
    if (shouldShowScore)
      msg = '<span style="color:#63d">' + this.board.score(0) + '</span> - <span style="color:#f72">' + this.board.score(1) + '</span> ';
    let myScore = this.board.score(this.player);
    let yourScore = this.board.score(this.player ^ 1);
    if (myScore > yourScore) {
      msg += 'You win!';
    } else if (myScore < yourScore) {
      msg += 'You lose...';
    } else {
      msg += 'Draw';
    }
    this.showMessage(msg);
  }

  showMessage(msg) {
    let elem = document.getElementById('message');
    elem.innerHTML = msg;
    elem.style.visibility = 'visible';
  }

  hideMessage() {
    document.getElementById('message').style.visibility = 'hidden';
  }
}
