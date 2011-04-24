
function Move(x, y, piece_id) {
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

Move.prototype.x = function() { return this.m >> 4 & 0xf; };
Move.prototype.y = function() { return this.m & 0xf; };
Move.prototype.pieceId = function() { return this.m >> 8; };
Move.prototype.blockId = function() { return this.m >> 11; };
Move.prototype.direction = function() { return this.m >> 8 & 0x7; };
Move.prototype.isPass = function() { return this.m == 0xffff; };
Move.prototype.fourcc = Move.prototype.toString = function() {
  if (this.isPass())
    return '----';
  return ((this.m & 0xff) + 0x11).toString(16) +
    String.fromCharCode(117 - this.blockId()) +
    this.direction();
};

Move.INVALID_MOVE = new Move(0xfffe);
Move.PASS = new Move(0xffff);


function Board() {
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
}

Board.VIOLET_MASK = 0x07;
Board.ORANGE_MASK = 0x70;
Board.VIOLET_EDGE = 0x01;
Board.ORANGE_EDGE = 0x10;
Board.VIOLET_SIDE = 0x02;
Board.ORANGE_SIDE = 0x20;
Board.VIOLET_BLOCK = 0x04;
Board.ORANGE_BLOCK = 0x40;

Board.prototype.inBounds = function(x, y) {
  return (x >= 0 && y >= 0 && x < 14 && y < 14);
};
Board.prototype.at = function(x, y) { return this.square[y][x]; };
Board.prototype.turn = function() { return this.history.length; };
Board.prototype.player = function() { return this.turn() % 2; };

Board.prototype.isValidMove = function(move) {
  if (move.isPass())
    return true;

  if (this.used[move.blockId() + this.player() * 21])
    return false;

  var rot = blockSet[move.blockId()].rotations[move.direction()];

  var mx = move.x(), my = move.y();
  if (!this._isMovable(mx, my, rot))
    return false;

  for (var i = 0; i < rot.size; i++) {
    var x = mx + rot.coords[i][0];
    var y = my + rot.coords[i][1];
    if (this.square[y][x] &
        [Board.VIOLET_EDGE, Board.ORANGE_EDGE][this.player()])
      return true;
  }
  return false;
};

Board.prototype.doMove = function(move) {
  if (move.isPass()) {
    this.history.push(move);
    return;
  }

  var rot = blockSet[move.blockId()].rotations[move.direction()];

  var block = [Board.VIOLET_BLOCK, Board.ORANGE_BLOCK][this.player()];
  var side_bit = [Board.VIOLET_SIDE, Board.ORANGE_SIDE][this.player()];
  var edge_bit = [Board.VIOLET_EDGE, Board.ORANGE_EDGE][this.player()];

  for (var i = 0; i < rot.size; i++) {
    var x = move.x() + rot.coords[i][0];
    var y = move.y() + rot.coords[i][1];
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
};

Board.prototype.doPass = function() { this.history.push(Move.PASS); };

Board.prototype.violetScore = function() {
  var score = 0;
  for (var i = 0; i < 21; i++) {
    if (this.used[i])
      score += blockSet[i].size;
  }
  return score;
};

Board.prototype.orangeScore = function() {
  var score = 0;
  for (var i = 0; i < 21; i++) {
    if (this.used[21 + i])
      score += blockSet[i].size;
  }
  return score;
};

Board.prototype._isMovable = function(px, py, rot) {
  var mask = (Board.VIOLET_BLOCK | Board.ORANGE_BLOCK) |
    [Board.VIOLET_SIDE, Board.ORANGE_SIDE][this.player()];

  for (var i = 0; i < rot.size; i++) {
    var x = px + rot.coords[i][0];
    var y = py + rot.coords[i][1];
    if (x < 0 || x >= 14 || y < 0 || y >= 14 || this.square[y][x] & mask)
      return false;
  }
  return true;
};

Board.prototype.isUsed = function(player, blockId) {
  return this.used[blockId + player * 21];
};

Board.prototype.canMove = function() {
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
};

Board.prototype.getPath = function() {
  return this.history.join('/');
};
