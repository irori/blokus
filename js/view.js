const SCALE = 20;

export class View {
  constructor(board, player) {
    this.board = board;
    this.player = player;
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

  showOpponentsPlaying(show) {
    if (show)
      this.showMessage(['Orange', 'Violet'][this.player] + ' plays');
    else
      this.hideMessage();
  }

  showEndMessage(shouldShowScore) {
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
