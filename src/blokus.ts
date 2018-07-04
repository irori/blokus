import { Move } from './move.js';
import { Board } from './board.js';
import { View } from './view.js';
import { Input, mqFullsize } from './input.js';
import Backend from './backend.js';
import './toolbar.js';

class Blokus {
  public level: number;
  private board: Board;
  private player: number;
  private view: View;
  private input: Input;
  private backend: Backend;

  constructor() {
    this.level = 1;
  }

  start(player: number) {
    this.board = new Board();
    this.player = player;
    this.view = new View(this.board, player);
    this.input = new Input(this.board, this.player, this.onPlayerMove.bind(this));
    this.backend = new Backend(this.onOpponentMove.bind(this));
    this.startGame();
    if (player == 1)
      this.opponentMove();
  }

  resume(path: string) {
    this.board = new Board(path);
    this.player = this.board.player();
    this.view = new View(this.board, this.player);
    this.input = new Input(this.board, this.player, this.onPlayerMove.bind(this));
    this.backend = new Backend(this.onOpponentMove.bind(this));
    // FIXME
    // this.startGame(path);
  }

  onPlayerMove(move: Move) {
    this.board.doMove(move);
    this.opponentMove();
    this.view.onPlayerMove();
  }

  opponentMove() {
    this.view.startOpponentMove();
    this.backend.request(this.board.getPath(), this.level);
  }

  onOpponentMove(move: Move) {
    this.board.doMove(move);
    this.view.onOpponentMove(move);
    this.input.createPieces();
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
    this.input.createPieces();
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

function startButton(player: number) {
  blokus.start(player);
}
document.getElementById('start-violet').addEventListener('click', () => startButton(0));
document.getElementById('start-orange').addEventListener('click', () => startButton(1));

function setLevel(lv: number) {
  blokus.level = lv;
}
document.getElementById('level1').addEventListener('click', () => setLevel(1));
document.getElementById('level2').addEventListener('click', () => setLevel(2));
document.getElementById('level3').addEventListener('click', () => setLevel(3));
