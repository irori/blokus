import { pieceSet, blockSet } from './piece.js'

export class Move {
  constructor(x, y, piece_id) {
    if (arguments.length == 3)
      this.m = x << 4 | y | piece_id << 8;
    else if (typeof x == 'number')
      this.m = x;
    else if (x == '----')
      this.m = 0xffff;
    else {
      var xy = parseInt(x.substring(0, 2), 16);
      var blk = 117 - x.charCodeAt(2); // 117 is 'u'
      var dir = parseInt(x.substring(3));
      this.m = xy - 0x11 | blk << 11 | dir << 8;
    }
  }

  x() { return this.m >> 4 & 0xf; }
  y() { return this.m & 0xf; }
  pieceId() { return this.m >> 8; }
  blockId() { return this.m >> 11; }
  direction() { return this.m >> 8 & 0x7; }
  isPass() { return this.m == 0xffff; }

  fourcc() {
    if (this.isPass())
      return '----';
    return ((this.m & 0xff) + 0x11).toString(16) +
      String.fromCharCode(117 - this.blockId()) +
      this.direction();
  }
  toString() { return this.fourcc(); }

  coords() {
    if (this.isPass())
      return [];
    var rot = blockSet[this.blockId()].rotations[this.direction()];
    var coords = [];
    for (var i = 0; i < rot.size; i++)
      coords[i] = { x: this.x() + rot.coords[i].x,
                    y: this.y() + rot.coords[i].y };
    return coords;
  }
}
Move.INVALID_MOVE = new Move(0xfffe);
Move.PASS = new Move(0xffff);

export class Board {
  constructor(path) {
    this.square = [];
    for (var y = 0; y < 14; y++) {
      this.square[y] = [];
      for (var x = 0; x < 14; x++)
        this.square[y][x] = 0;
    }
    this.square[4][4] = Board.VIOLET_EDGE;
    this.square[9][9] = Board.ORANGE_EDGE;
    this.history = [];
    this.used = new Array(21 * 2);

    if (path) {
      var moves = path.split('/');
      for (var i = 0; i < moves.length; i++) {
        if (!moves[i])
          continue;
        var move = new Move(moves[i]);
        if (this.isValidMove(move))
          this.doMove(move);
        else
          throw new Error('invalid move: ' + moves[i]);
      }
    }
  }

  inBounds(x, y) { return (x >= 0 && y >= 0 && x < 14 && y < 14); }
  at(x, y) { return this.square[y][x]; }
  turn() { return this.history.length; }
  player() { return this.turn() % 2; }

  isValidMove(move) {
    if (move.isPass())
      return true;

    if (this.used[move.blockId() + this.player() * 21])
      return false;

    var coords = move.coords();

    if (!this._isMovable(coords))
      return false;

    for (var i = 0; i < coords.length; i++) {
      if (this.square[coords[i].y][coords[i].x] &
          [Board.VIOLET_EDGE, Board.ORANGE_EDGE][this.player()])
        return true;
    }
    return false;
  }

  doMove(move) {
    if (move.isPass()) {
      this.history.push(move);
      return;
    }

    var coords = move.coords();

    var block = [Board.VIOLET_BLOCK, Board.ORANGE_BLOCK][this.player()];
    var side_bit = [Board.VIOLET_SIDE, Board.ORANGE_SIDE][this.player()];
    var edge_bit = [Board.VIOLET_EDGE, Board.ORANGE_EDGE][this.player()];

    for (var i = 0; i < coords.length; i++) {
      var x = coords[i].x, y = coords[i].y;
      this.square[y][x] |= block;
      if (this.inBounds(x - 1, y)) this.square[y][x - 1] |= side_bit;
      if (this.inBounds(x, y - 1)) this.square[y - 1][x] |= side_bit;
      if (this.inBounds(x + 1, y)) this.square[y][x + 1] |= side_bit;
      if (this.inBounds(x, y + 1)) this.square[y + 1][x] |= side_bit;
      if (this.inBounds(x - 1, y - 1)) this.square[y - 1][x - 1] |= edge_bit;
      if (this.inBounds(x + 1, y - 1)) this.square[y - 1][x + 1] |= edge_bit;
      if (this.inBounds(x - 1, y + 1)) this.square[y + 1][x - 1] |= edge_bit;
      if (this.inBounds(x + 1, y + 1)) this.square[y + 1][x + 1] |= edge_bit;
    }

    this.used[move.blockId() + this.player() * 21] = true;
    this.history.push(move);
  }

  doPass() { this.history.push(Move.PASS); }

  score(player) {
    var score = 0;
    for (var i = 0; i < 21; i++) {
      if (this.used[i + player * 21])
        score += blockSet[i].size;
    }
    return score;
  }

  _isMovable(coords) {
    var mask = (Board.VIOLET_BLOCK | Board.ORANGE_BLOCK) |
      [Board.VIOLET_SIDE, Board.ORANGE_SIDE][this.player()];

    for (var i = 0; i < coords.length; i++) {
      var x = coords[i].x, y = coords[i].y;
      if (x < 0 || x >= 14 || y < 0 || y >= 14 || this.square[y][x] & mask)
        return false;
    }
    return true;
  }

  isUsed(player, blockId) {
    return this.used[blockId + player * 21];
  }

  canMove() {
    for (var p in pieceSet) {
      var id = pieceSet[p].id;
      if (this.used[(id >> 3) + this.player() * 21])
        continue;
      for (var y = 0; y < 14; y++) {
        for (var x = 0; x < 14; x++) {
          if (this.isValidMove(new Move(x, y, id)))
            return true;
        }
      }
    }
    return false;
  }

  getPath() { return this.history.join('/'); }
}
Board.VIOLET_MASK = 0x07;
Board.ORANGE_MASK = 0x70;
Board.VIOLET_EDGE = 0x01;
Board.ORANGE_EDGE = 0x10;
Board.VIOLET_SIDE = 0x02;
Board.ORANGE_SIDE = 0x20;
Board.VIOLET_BLOCK = 0x04;
Board.ORANGE_BLOCK = 0x40;
