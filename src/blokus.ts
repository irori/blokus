import { Move } from './move.ts';
import { Board } from './board.ts';
import { View } from './view.ts';
import { Input, mqFullsize } from './input.ts';
import Backend from './backend.ts';
import './toolbar.ts';

declare function gtag(...args: any): void;

class Blokus {
  private board: Board;
  private view: View;
  private input: Input;
  private backend: Backend;
  private level: number;

  constructor(player: number, level: number, backend: Backend) {
    this.level = level;
    this.board = new Board();
    this.view = new View(this.board, player);
    this.input = new Input(this.board, player, this.onPlayerMove.bind(this));
    this.backend = backend;
    this.startGame();
    if (player == 1)
      this.opponentMove();
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
    gtag('event', 'gameend');
  }

  startGame() {
    document.getElementById('start-game')!.style.visibility = 'hidden';
    this.input.createPieces();
    this.view.startGame();
    gtag('event', 'gamestart');
  }
}

let level = 1;
let blokus: Blokus;
function startButton(player: number) {
  blokus = new Blokus(player, level, backend);
}

function showUnsupported(message: string) {
  document.getElementById('unsupported')!.textContent = message;
  document.getElementById('unsupported')!.hidden = false;
  document.getElementById('start-game')!.hidden = true;
}

function showBackendError(error: Error) {
  showUnsupported('The computer player could not be started.');
  gtag('event', 'backenderror', {error_type: error.message});
}

const backend = new Backend((move) => blokus.onOpponentMove(move));
backend.failure.then(showBackendError);

document.getElementById('start-violet')!.addEventListener('click', () => startButton(0));
document.getElementById('start-orange')!.addEventListener('click', () => startButton(1));
document.getElementById('level1')!.addEventListener('click', () => level = 1);
document.getElementById('level2')!.addEventListener('click', () => level = 2);
document.getElementById('level3')!.addEventListener('click', () => level = 3);
