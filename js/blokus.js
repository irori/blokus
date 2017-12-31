import { Board } from './board.js'
import { View } from './view.js'
import { initInput, createPieces, mqFullsize } from './input.js'
import Backend from './backend.js'

let Blokus = { level: 1 };

function onPlayerMove(move) {
  Blokus.board.doMove(move);
  opponentMove();
  Blokus.view.onPlayerMove();
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
  }
}

function gameEnd() {
  Blokus.view.gameEnd(!mqFullsize.matches);
  if (!mqFullsize.matches)
    Blokus.player = null;
}

function startGame() {
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
    initInput(Blokus.board, Blokus.player, onPlayerMove);
    Blokus.backend = new Backend(onOpponentMove);
    startGame(path);
  }
});

function startButton(player) {
  Blokus.board = new Board();
  Blokus.player = player;
  Blokus.view = new View(Blokus.board, player);
  initInput(Blokus.board, Blokus.player, onPlayerMove);
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
