import { Board } from './board.js'
import { View } from './view.js'
import { initInput, createPieces, mqFullsize } from './input.js'
import Backend from './backend.js'

class Blokus {
  constructor() {
    this.level = 1;
  }

  start(player) {
    this.board = new Board();
    this.player = player;
    this.view = new View(this.board, player);
    initInput(this.board, this.player, this.onPlayerMove.bind(this));
    this.backend = new Backend(this.onOpponentMove.bind(this));
    this.startGame();
    if (player == 1)
      this.opponentMove();
  }

  resume(path) {
    this.board = new Board(path);
    this.player = this.board.player();
    this.view = new View(this.board, this.player);
    initInput(this.board, this.player, this.onPlayerMove.bind(this));
    this.backend = new Backend(this.onOpponentMove.bind(this));
    this.startGame(path);
  }

  onPlayerMove(move) {
    this.board.doMove(move);
    this.opponentMove();
    this.view.onPlayerMove();
  }

  opponentMove() {
    this.view.startOpponentMove();
    this.backend.request(this.board.getPath(), this.level);
  }

  onOpponentMove(move) {
    this.board.doMove(move);
    this.view.onOpponentMove(move);
    createPieces();
    // window.location.replace('#' + this.board.getPath());
    if (!this.board.canMove()) {
      if (move.isPass())
        this.gameEnd();
      else {
        this.board.doPass();
        this.opponentMove();
      }
    }
  }

  gameEnd() {
    this.view.gameEnd(!mqFullsize.matches);
    if (!mqFullsize.matches)
      this.player = null;
  }

  startGame() {
    document.getElementById('start-game').style.visibility = 'hidden';
    createPieces();
    this.view.startGame();
  }
}

const blokus = new Blokus();
export default blokus;

window.addEventListener('load', () => {
  let path = window.location.hash.substring(1);
  if (path)
    blokus.resume(path);
});

function startButton(player) {
  blokus.start(player);
}
document.getElementById('start-violet').addEventListener('click', () => startButton(0));
document.getElementById('start-orange').addEventListener('click', () => startButton(1));

function setLevel(lv) {
  blokus.level = lv;
}
document.getElementById('level1').addEventListener('click', () => setLevel(1));
document.getElementById('level2').addEventListener('click', () => setLevel(2));
document.getElementById('level3').addEventListener('click', () => setLevel(3));
