import { Board } from './board.js';
import { View } from './view.js';
import { Input, mqFullsize } from './input.js';
import Backend from './backend.js';
import './toolbar.js';
class Blokus {
    constructor(player, level) {
        this.level = level;
        this.board = new Board();
        this.view = new View(this.board, player);
        this.input = new Input(this.board, player, this.onPlayerMove.bind(this));
        this.backend = new Backend(this.onOpponentMove.bind(this));
        this.startGame();
        if (player == 1)
            this.opponentMove();
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
        document.getElementById('start-game').style.visibility = 'hidden';
        this.input.createPieces();
        this.view.startGame();
        gtag('event', 'gamestart');
    }
}
let level = 1;
function startButton(player) {
    const blokus = new Blokus(player, level);
}
document.getElementById('start-violet').addEventListener('click', () => startButton(0));
document.getElementById('start-orange').addEventListener('click', () => startButton(1));
document.getElementById('level1').addEventListener('click', () => level = 1);
document.getElementById('level2').addEventListener('click', () => level = 2);
document.getElementById('level3').addEventListener('click', () => level = 3);
