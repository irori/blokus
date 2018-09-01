var blokus = (function () {
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();



























var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var Piece = function Piece(id, coords) {
    classCallCheck(this, Piece);

    this.id = id;
    this.size = coords.length;
    this.coords = [];
    for (var i = 0; i < coords.length; i++) {
        this.coords[i] = { x: coords[i][0], y: coords[i][1] };
    }
};

var Rotation = function Rotation(config) {
    classCallCheck(this, Rotation);

    var _config = slicedToArray(config, 3);

    this.offsetX = _config[0];
    this.offsetY = _config[1];
    this.piece = _config[2];

    this.size = this.piece.size;
    this.coords = [];
    for (var i = 0; i < this.piece.size; i++) {
        this.coords[i] = { x: this.piece.coords[i].x + this.offsetX,
            y: this.piece.coords[i].y + this.offsetY };
    }
};

var Block = function Block(id, size, rotations) {
    classCallCheck(this, Block);

    this.id = id;
    this.size = size;
    this.rotations = [];
    for (var i = 0; i < 8; i++) {
        this.rotations[i] = new Rotation(rotations[i]);
    }
};

var pieceSet = {
    u0: new Piece(0x00, [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]),
    t0: new Piece(0x08, [[-1, -1], [-1, 0], [0, 0], [1, 0], [0, 1]]),
    t1: new Piece(0x09, [[1, -1], [1, 0], [0, 0], [-1, 0], [0, 1]]),
    t2: new Piece(0x0a, [[1, -1], [0, -1], [0, 0], [0, 1], [-1, 0]]),
    t3: new Piece(0x0b, [[-1, -1], [0, -1], [0, 0], [0, 1], [1, 0]]),
    t4: new Piece(0x0c, [[1, 1], [1, 0], [0, 0], [-1, 0], [0, -1]]),
    t5: new Piece(0x0d, [[-1, 1], [-1, 0], [0, 0], [1, 0], [0, -1]]),
    t6: new Piece(0x0e, [[-1, 1], [0, 1], [0, 0], [0, -1], [1, 0]]),
    t7: new Piece(0x0f, [[1, 1], [0, 1], [0, 0], [0, -1], [-1, 0]]),
    s0: new Piece(0x10, [[0, 0], [1, 0], [1, 1], [-1, 0], [-1, -1]]),
    s1: new Piece(0x11, [[0, 0], [-1, 0], [-1, 1], [1, 0], [1, -1]]),
    s2: new Piece(0x12, [[0, 0], [0, 1], [-1, 1], [0, -1], [1, -1]]),
    s3: new Piece(0x13, [[0, 0], [0, 1], [1, 1], [0, -1], [-1, -1]]),
    r0: new Piece(0x18, [[0, 0], [1, 0], [1, 1], [0, -1], [-1, -1]]),
    r1: new Piece(0x19, [[0, 0], [-1, 0], [-1, 1], [0, -1], [1, -1]]),
    r2: new Piece(0x1a, [[0, 0], [0, 1], [-1, 1], [1, 0], [1, -1]]),
    r3: new Piece(0x1b, [[0, 0], [0, 1], [1, 1], [-1, 0], [-1, -1]]),
    q0: new Piece(0x20, [[0, 0], [1, 0], [2, 0], [0, -1], [0, -2]]),
    q1: new Piece(0x21, [[0, 0], [-1, 0], [-2, 0], [0, -1], [0, -2]]),
    q2: new Piece(0x22, [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]]),
    q3: new Piece(0x23, [[0, 0], [0, 1], [0, 2], [-1, 0], [-2, 0]]),
    p0: new Piece(0x28, [[0, 0], [0, -1], [0, 1], [-1, 1], [1, 1]]),
    p2: new Piece(0x2a, [[0, 0], [1, 0], [-1, 0], [-1, -1], [-1, 1]]),
    p3: new Piece(0x2b, [[0, 0], [-1, 0], [1, 0], [1, -1], [1, 1]]),
    p4: new Piece(0x2c, [[0, 0], [0, 1], [0, -1], [1, -1], [-1, -1]]),
    o0: new Piece(0x30, [[0, -1], [0, 0], [1, 0], [0, 1], [0, 2]]),
    o1: new Piece(0x31, [[0, -1], [0, 0], [-1, 0], [0, 1], [0, 2]]),
    o2: new Piece(0x32, [[1, 0], [0, 0], [0, 1], [-1, 0], [-2, 0]]),
    o3: new Piece(0x33, [[-1, 0], [0, 0], [0, 1], [1, 0], [2, 0]]),
    o4: new Piece(0x34, [[0, 1], [0, 0], [-1, 0], [0, -1], [0, -2]]),
    o5: new Piece(0x35, [[0, 1], [0, 0], [1, 0], [0, -1], [0, -2]]),
    o6: new Piece(0x36, [[-1, 0], [0, 0], [0, -1], [1, 0], [2, 0]]),
    o7: new Piece(0x37, [[1, 0], [0, 0], [0, -1], [-1, 0], [-2, 0]]),
    n0: new Piece(0x38, [[0, 0], [0, 1], [-1, 1], [0, -1], [-1, -1]]),
    n1: new Piece(0x39, [[0, 0], [0, 1], [1, 1], [0, -1], [1, -1]]),
    n2: new Piece(0x3a, [[0, 0], [-1, 0], [-1, -1], [1, 0], [1, -1]]),
    n6: new Piece(0x3e, [[0, 0], [1, 0], [1, 1], [-1, 0], [-1, 1]]),
    m0: new Piece(0x40, [[0, -1], [-1, 0], [0, 0], [-1, 1], [0, 1]]),
    m1: new Piece(0x41, [[0, -1], [1, 0], [0, 0], [1, 1], [0, 1]]),
    m2: new Piece(0x42, [[1, 0], [0, -1], [0, 0], [-1, -1], [-1, 0]]),
    m3: new Piece(0x43, [[-1, 0], [0, -1], [0, 0], [1, -1], [1, 0]]),
    m4: new Piece(0x44, [[0, 1], [1, 0], [0, 0], [1, -1], [0, -1]]),
    m5: new Piece(0x45, [[0, 1], [-1, 0], [0, 0], [-1, -1], [0, -1]]),
    m6: new Piece(0x46, [[-1, 0], [0, 1], [0, 0], [1, 1], [1, 0]]),
    m7: new Piece(0x47, [[1, 0], [0, 1], [0, 0], [-1, 1], [-1, 0]]),
    l0: new Piece(0x48, [[0, -2], [0, -1], [0, 0], [-1, 0], [-1, 1]]),
    l1: new Piece(0x49, [[0, -2], [0, -1], [0, 0], [1, 0], [1, 1]]),
    l2: new Piece(0x4a, [[2, 0], [1, 0], [0, 0], [0, -1], [-1, -1]]),
    l3: new Piece(0x4b, [[-2, 0], [-1, 0], [0, 0], [0, -1], [1, -1]]),
    l4: new Piece(0x4c, [[0, 2], [0, 1], [0, 0], [1, 0], [1, -1]]),
    l5: new Piece(0x4d, [[0, 2], [0, 1], [0, 0], [-1, 0], [-1, -1]]),
    l6: new Piece(0x4e, [[-2, 0], [-1, 0], [0, 0], [0, 1], [1, 1]]),
    l7: new Piece(0x4f, [[2, 0], [1, 0], [0, 0], [0, 1], [-1, 1]]),
    k0: new Piece(0x50, [[0, 0], [0, 1], [0, -2], [0, -1], [-1, 1]]),
    k1: new Piece(0x51, [[0, 0], [0, 1], [0, -2], [0, -1], [1, 1]]),
    k2: new Piece(0x52, [[0, 0], [-1, 0], [2, 0], [1, 0], [-1, -1]]),
    k3: new Piece(0x53, [[0, 0], [1, 0], [-2, 0], [-1, 0], [1, -1]]),
    k4: new Piece(0x54, [[0, 0], [0, -1], [0, 2], [0, 1], [1, -1]]),
    k5: new Piece(0x55, [[0, 0], [0, -1], [0, 2], [0, 1], [-1, -1]]),
    k6: new Piece(0x56, [[0, 0], [1, 0], [-2, 0], [-1, 0], [1, 1]]),
    k7: new Piece(0x57, [[0, 0], [-1, 0], [2, 0], [1, 0], [-1, 1]]),
    j0: new Piece(0x58, [[0, 0], [0, 1], [0, 2], [0, -1], [0, -2]]),
    j2: new Piece(0x5a, [[0, 0], [-1, 0], [-2, 0], [1, 0], [2, 0]]),
    i0: new Piece(0x60, [[-1, 0], [0, 0], [0, 1], [1, 1]]),
    i1: new Piece(0x61, [[1, 0], [0, 0], [0, 1], [-1, 1]]),
    i2: new Piece(0x62, [[0, -1], [0, 0], [-1, 0], [-1, 1]]),
    i3: new Piece(0x63, [[0, -1], [0, 0], [1, 0], [1, 1]]),
    h0: new Piece(0x68, [[0, 0], [1, 0], [0, 1], [1, 1]]),
    g0: new Piece(0x70, [[0, 0], [1, 0], [0, 1], [0, -1]]),
    g1: new Piece(0x71, [[0, 0], [-1, 0], [0, 1], [0, -1]]),
    g2: new Piece(0x72, [[0, 0], [0, 1], [-1, 0], [1, 0]]),
    g6: new Piece(0x76, [[0, 0], [0, -1], [1, 0], [-1, 0]]),
    f0: new Piece(0x78, [[0, 0], [0, -1], [0, 1], [-1, 1]]),
    f1: new Piece(0x79, [[0, 0], [0, -1], [0, 1], [1, 1]]),
    f2: new Piece(0x7a, [[0, 0], [1, 0], [-1, 0], [-1, -1]]),
    f3: new Piece(0x7b, [[0, 0], [-1, 0], [1, 0], [1, -1]]),
    f4: new Piece(0x7c, [[0, 0], [0, 1], [0, -1], [1, -1]]),
    f5: new Piece(0x7d, [[0, 0], [0, 1], [0, -1], [-1, -1]]),
    f6: new Piece(0x7e, [[0, 0], [-1, 0], [1, 0], [1, 1]]),
    f7: new Piece(0x7f, [[0, 0], [1, 0], [-1, 0], [-1, 1]]),
    e0: new Piece(0x80, [[0, 0], [0, 1], [0, 2], [0, -1]]),
    e2: new Piece(0x82, [[0, 0], [-1, 0], [-2, 0], [1, 0]]),
    d0: new Piece(0x88, [[0, 0], [1, 0], [0, -1]]),
    d1: new Piece(0x89, [[0, 0], [-1, 0], [0, -1]]),
    d2: new Piece(0x8a, [[0, 0], [0, 1], [1, 0]]),
    d3: new Piece(0x8b, [[0, 0], [0, 1], [-1, 0]]),
    c0: new Piece(0x90, [[0, 0], [0, 1], [0, -1]]),
    c2: new Piece(0x92, [[0, 0], [-1, 0], [1, 0]]),
    b0: new Piece(0x98, [[0, 0], [0, 1]]),
    b2: new Piece(0x9a, [[0, 0], [-1, 0]]),
    a0: new Piece(0xa0, [[0, 0]])
};
var blockSet = [new Block(0x00, 5, [[0, 0, pieceSet.u0], [0, 0, pieceSet.u0], [0, 0, pieceSet.u0], [0, 0, pieceSet.u0], [0, 0, pieceSet.u0], [0, 0, pieceSet.u0], [0, 0, pieceSet.u0], [0, 0, pieceSet.u0]]), new Block(0x08, 5, [[0, 0, pieceSet.t0], [0, 0, pieceSet.t1], [0, 0, pieceSet.t2], [0, 0, pieceSet.t3], [0, 0, pieceSet.t4], [0, 0, pieceSet.t5], [0, 0, pieceSet.t6], [0, 0, pieceSet.t7]]), new Block(0x10, 5, [[0, 0, pieceSet.s0], [0, 0, pieceSet.s1], [0, 0, pieceSet.s2], [0, 0, pieceSet.s3], [0, 0, pieceSet.s0], [0, 0, pieceSet.s1], [0, 0, pieceSet.s2], [0, 0, pieceSet.s3]]), new Block(0x18, 5, [[0, 0, pieceSet.r0], [0, 0, pieceSet.r1], [0, 0, pieceSet.r2], [0, 0, pieceSet.r3], [0, 0, pieceSet.r3], [0, 0, pieceSet.r2], [0, 0, pieceSet.r1], [0, 0, pieceSet.r0]]), new Block(0x20, 5, [[0, 0, pieceSet.q0], [0, 0, pieceSet.q1], [0, 0, pieceSet.q2], [0, 0, pieceSet.q3], [0, 0, pieceSet.q3], [0, 0, pieceSet.q2], [0, 0, pieceSet.q1], [0, 0, pieceSet.q0]]), new Block(0x28, 5, [[0, 0, pieceSet.p0], [0, 0, pieceSet.p0], [0, 0, pieceSet.p2], [0, 0, pieceSet.p3], [0, 0, pieceSet.p4], [0, 0, pieceSet.p4], [0, 0, pieceSet.p3], [0, 0, pieceSet.p2]]), new Block(0x30, 5, [[0, 0, pieceSet.o0], [0, 0, pieceSet.o1], [0, 0, pieceSet.o2], [0, 0, pieceSet.o3], [0, 0, pieceSet.o4], [0, 0, pieceSet.o5], [0, 0, pieceSet.o6], [0, 0, pieceSet.o7]]), new Block(0x38, 5, [[0, 0, pieceSet.n0], [0, 0, pieceSet.n1], [0, 0, pieceSet.n2], [0, 0, pieceSet.n2], [0, 0, pieceSet.n1], [0, 0, pieceSet.n0], [0, 0, pieceSet.n6], [0, 0, pieceSet.n6]]), new Block(0x40, 5, [[0, 0, pieceSet.m0], [0, 0, pieceSet.m1], [0, 0, pieceSet.m2], [0, 0, pieceSet.m3], [0, 0, pieceSet.m4], [0, 0, pieceSet.m5], [0, 0, pieceSet.m6], [0, 0, pieceSet.m7]]), new Block(0x48, 5, [[0, 0, pieceSet.l0], [0, 0, pieceSet.l1], [0, 0, pieceSet.l2], [0, 0, pieceSet.l3], [0, 0, pieceSet.l4], [0, 0, pieceSet.l5], [0, 0, pieceSet.l6], [0, 0, pieceSet.l7]]), new Block(0x50, 5, [[0, 0, pieceSet.k0], [0, 0, pieceSet.k1], [0, 0, pieceSet.k2], [0, 0, pieceSet.k3], [0, 0, pieceSet.k4], [0, 0, pieceSet.k5], [0, 0, pieceSet.k6], [0, 0, pieceSet.k7]]), new Block(0x58, 5, [[0, 0, pieceSet.j0], [0, 0, pieceSet.j0], [0, 0, pieceSet.j2], [0, 0, pieceSet.j2], [0, 0, pieceSet.j0], [0, 0, pieceSet.j0], [0, 0, pieceSet.j2], [0, 0, pieceSet.j2]]), new Block(0x60, 4, [[0, 0, pieceSet.i0], [0, 0, pieceSet.i1], [0, 0, pieceSet.i2], [0, 0, pieceSet.i3], [0, -1, pieceSet.i0], [0, -1, pieceSet.i1], [1, 0, pieceSet.i2], [-1, 0, pieceSet.i3]]), new Block(0x68, 4, [[0, 0, pieceSet.h0], [-1, 0, pieceSet.h0], [-1, 0, pieceSet.h0], [0, 0, pieceSet.h0], [-1, -1, pieceSet.h0], [0, -1, pieceSet.h0], [0, -1, pieceSet.h0], [-1, -1, pieceSet.h0]]), new Block(0x70, 4, [[0, 0, pieceSet.g0], [0, 0, pieceSet.g1], [0, 0, pieceSet.g2], [0, 0, pieceSet.g2], [0, 0, pieceSet.g1], [0, 0, pieceSet.g0], [0, 0, pieceSet.g6], [0, 0, pieceSet.g6]]), new Block(0x78, 4, [[0, 0, pieceSet.f0], [0, 0, pieceSet.f1], [0, 0, pieceSet.f2], [0, 0, pieceSet.f3], [0, 0, pieceSet.f4], [0, 0, pieceSet.f5], [0, 0, pieceSet.f6], [0, 0, pieceSet.f7]]), new Block(0x80, 4, [[0, 0, pieceSet.e0], [0, 0, pieceSet.e0], [0, 0, pieceSet.e2], [1, 0, pieceSet.e2], [0, -1, pieceSet.e0], [0, -1, pieceSet.e0], [1, 0, pieceSet.e2], [0, 0, pieceSet.e2]]), new Block(0x88, 3, [[0, 0, pieceSet.d0], [0, 0, pieceSet.d1], [0, 0, pieceSet.d2], [0, 0, pieceSet.d3], [0, 0, pieceSet.d3], [0, 0, pieceSet.d2], [0, 0, pieceSet.d1], [0, 0, pieceSet.d0]]), new Block(0x90, 3, [[0, 0, pieceSet.c0], [0, 0, pieceSet.c0], [0, 0, pieceSet.c2], [0, 0, pieceSet.c2], [0, 0, pieceSet.c0], [0, 0, pieceSet.c0], [0, 0, pieceSet.c2], [0, 0, pieceSet.c2]]), new Block(0x98, 2, [[0, 0, pieceSet.b0], [0, 0, pieceSet.b0], [0, 0, pieceSet.b2], [1, 0, pieceSet.b2], [0, -1, pieceSet.b0], [0, -1, pieceSet.b0], [1, 0, pieceSet.b2], [0, 0, pieceSet.b2]]), new Block(0xa0, 1, [[0, 0, pieceSet.a0], [0, 0, pieceSet.a0], [0, 0, pieceSet.a0], [0, 0, pieceSet.a0], [0, 0, pieceSet.a0], [0, 0, pieceSet.a0], [0, 0, pieceSet.a0], [0, 0, pieceSet.a0]])];

var Move = function () {
    function Move(x, y, piece_id) {
        classCallCheck(this, Move);

        if (typeof x == 'number') {
            if (arguments.length == 3) this.m = x << 4 | y | piece_id << 8;else this.m = x;
        } else if (x == '----') {
            this.m = 0xffff;
        } else {
            var xy = parseInt(x.substring(0, 2), 16);
            var blk = 117 - x.charCodeAt(2); // 117 is 'u'
            var dir = parseInt(x.substring(3));
            this.m = xy - 0x11 | blk << 11 | dir << 8;
        }
    }

    createClass(Move, [{
        key: 'x',
        value: function x() {
            return this.m >> 4 & 0xf;
        }
    }, {
        key: 'y',
        value: function y() {
            return this.m & 0xf;
        }
    }, {
        key: 'pieceId',
        value: function pieceId() {
            return this.m >> 8;
        }
    }, {
        key: 'blockId',
        value: function blockId() {
            return this.m >> 11;
        }
    }, {
        key: 'direction',
        value: function direction() {
            return this.m >> 8 & 0x7;
        }
    }, {
        key: 'isPass',
        value: function isPass() {
            return this.m == 0xffff;
        }
    }, {
        key: 'fourcc',
        value: function fourcc() {
            if (this.isPass()) return '----';
            return ((this.m & 0xff) + 0x11).toString(16) + String.fromCharCode(117 - this.blockId()) + this.direction();
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.fourcc();
        }
    }, {
        key: 'coords',
        value: function coords() {
            if (this.isPass()) return [];
            var rot = blockSet[this.blockId()].rotations[this.direction()];
            var coords = [];
            for (var i = 0; i < rot.size; i++) {
                coords[i] = { x: this.x() + rot.coords[i].x,
                    y: this.y() + rot.coords[i].y };
            }return coords;
        }
    }]);
    return Move;
}();
var PASS = new Move(0xffff);

var VIOLET_EDGE = 0x01;
var ORANGE_EDGE = 0x10;
var VIOLET_SIDE = 0x02;
var ORANGE_SIDE = 0x20;
var VIOLET_BLOCK = 0x04;
var ORANGE_BLOCK = 0x40;
var Board = function () {
    function Board(path) {
        classCallCheck(this, Board);

        this.square = [];
        for (var y = 0; y < 14; y++) {
            this.square[y] = [];
            for (var x = 0; x < 14; x++) {
                this.square[y][x] = 0;
            }
        }
        this.square[4][4] = VIOLET_EDGE;
        this.square[9][9] = ORANGE_EDGE;
        this.history = [];
        this.used = new Array(21 * 2);
        if (path) {
            var moves = path.split('/');
            for (var i = 0; i < moves.length; i++) {
                if (!moves[i]) continue;
                var move = new Move(moves[i]);
                if (this.isValidMove(move)) this.doMove(move);else throw new Error('invalid move: ' + moves[i]);
            }
        }
    }

    createClass(Board, [{
        key: 'inBounds',
        value: function inBounds(x, y) {
            return x >= 0 && y >= 0 && x < 14 && y < 14;
        }
    }, {
        key: 'turn',
        value: function turn() {
            return this.history.length;
        }
    }, {
        key: 'player',
        value: function player() {
            return this.turn() % 2;
        }
    }, {
        key: 'colorAt',
        value: function colorAt(x, y) {
            if (this.square[y][x] & VIOLET_BLOCK) return 'violet';
            if (this.square[y][x] & ORANGE_BLOCK) return 'orange';
            return null;
        }
    }, {
        key: 'isValidMove',
        value: function isValidMove(move) {
            if (move.isPass()) return true;
            if (this.used[move.blockId() + this.player() * 21]) return false;
            var coords = move.coords();
            if (!this._isMovable(coords)) return false;
            for (var i = 0; i < coords.length; i++) {
                if (this.square[coords[i].y][coords[i].x] & [VIOLET_EDGE, ORANGE_EDGE][this.player()]) return true;
            }
            return false;
        }
    }, {
        key: 'doMove',
        value: function doMove(move) {
            if (move.isPass()) {
                this.history.push(move);
                return;
            }
            var coords = move.coords();
            var block = [VIOLET_BLOCK, ORANGE_BLOCK][this.player()];
            var side_bit = [VIOLET_SIDE, ORANGE_SIDE][this.player()];
            var edge_bit = [VIOLET_EDGE, ORANGE_EDGE][this.player()];
            for (var i = 0; i < coords.length; i++) {
                var _coords$i = coords[i],
                    x = _coords$i.x,
                    y = _coords$i.y;

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
    }, {
        key: 'doPass',
        value: function doPass() {
            this.history.push(PASS);
        }
    }, {
        key: 'score',
        value: function score(player) {
            var score = 0;
            for (var i = 0; i < 21; i++) {
                if (this.used[i + player * 21]) score += blockSet[i].size;
            }
            return score;
        }
    }, {
        key: '_isMovable',
        value: function _isMovable(coords) {
            var mask = VIOLET_BLOCK | ORANGE_BLOCK | [VIOLET_SIDE, ORANGE_SIDE][this.player()];
            for (var i = 0; i < coords.length; i++) {
                var _coords$i2 = coords[i],
                    x = _coords$i2.x,
                    y = _coords$i2.y;

                if (x < 0 || x >= 14 || y < 0 || y >= 14 || this.square[y][x] & mask) return false;
            }
            return true;
        }
    }, {
        key: 'isUsed',
        value: function isUsed(player, blockId) {
            return this.used[blockId + player * 21];
        }
    }, {
        key: 'canMove',
        value: function canMove() {
            for (var p in pieceSet) {
                var id = pieceSet[p].id;
                if (this.used[(id >> 3) + this.player() * 21]) continue;
                for (var y = 0; y < 14; y++) {
                    for (var x = 0; x < 14; x++) {
                        if (this.isValidMove(new Move(x, y, id))) return true;
                    }
                }
            }
            return false;
        }
    }, {
        key: 'getPath',
        value: function getPath() {
            return this.history.join('/');
        }
    }]);
    return Board;
}();

var SCALE = 20;
var piecePositionTable = [[1, 1, 0], [5, 1, 0], [9, 1, 0], [13, 1, 0], [16, 2, 0], [21, 1, 0], [24, 1, 0], [1, 5, 0], [4, 5, 0], [7, 5, 2], [12, 5, 2], [18, 5, 2], [23, 5, 0], [0, 8, 0], [4, 8, 2], [8, 9, 2], [13, 8, 2], [16, 9, 0], [20, 9, 2], [23, 8, 0], [25, 9, 0] // a
];
var View = function () {
    function View(board, player) {
        classCallCheck(this, View);

        this.board = board;
        this.player = player;
    }

    createClass(View, [{
        key: 'startGame',
        value: function startGame() {
            var names = ['You', 'Computer'];
            document.getElementById('violet-name').innerHTML = names[this.player];
            document.getElementById('orange-name').innerHTML = names[this.player ^ 1];
            this.createOpponentsPieces();
            this.update();
            this.setActiveArea();
            this.elapsed = [0, 0];
            this.timer = setInterval(this.timerHandler.bind(this), 1000);
        }
    }, {
        key: 'gameEnd',
        value: function gameEnd(shouldShowScore) {
            this.showGameEndMessage(shouldShowScore);
            clearInterval(this.timer);
        }
    }, {
        key: 'onPlayerMove',
        value: function onPlayerMove() {
            this.update();
        }
    }, {
        key: 'startOpponentMove',
        value: function startOpponentMove() {
            this.setActiveArea();
            this.showOpponentsPlaying(true);
        }
    }, {
        key: 'onOpponentMove',
        value: function onOpponentMove(move) {
            this.hideOpponentsPiece(move);
            this.showOpponentsPlaying(false);
            this.update(move);
            this.setActiveArea();
        }
    }, {
        key: 'timerHandler',
        value: function timerHandler() {
            function formatTime(t) {
                var m = Math.floor(t / 60),
                    s = t % 60;
                return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
            }
            this.elapsed[this.board.player()]++;
            document.getElementById('violet-time').innerHTML = formatTime(this.elapsed[0]);
            document.getElementById('orange-time').innerHTML = formatTime(this.elapsed[1]);
        }
    }, {
        key: 'createOpponentsPieces',
        value: function createOpponentsPieces() {
            var area = document.getElementById('opponents-pieces');
            for (var id = 0; id < piecePositionTable.length; id++) {
                var a = piecePositionTable[id];
                if (this.board.isUsed(1 - this.player, id)) continue;
                var x = 9 - a[1];
                var y = a[0];
                var dir = a[2] + 2 & 7;
                var s = SCALE >> 1;
                var piece = blockSet[id].rotations[dir];
                var elem = document.createElement('div');
                elem.id = 'o' + id;
                elem.setAttribute('style', 'left:' + x * s + 'px;' + 'top:' + y * s + 'px;' + 'position:absolute;');
                for (var i = 0; i < piece.size; i++) {
                    var cell = document.createElement('div');
                    cell.setAttribute('style', 'position:absolute;' + 'left:' + piece.coords[i].x * s + 'px;' + 'top:' + piece.coords[i].y * s + 'px;' + 'width:' + s + 'px;' + 'height:' + s + 'px;');
                    cell.className = 'block' + (1 - this.player);
                    elem.appendChild(cell);
                }
                area.appendChild(elem);
            }
        }
    }, {
        key: 'hideOpponentsPiece',
        value: function hideOpponentsPiece(move) {
            if (!move.isPass()) document.getElementById('o' + move.blockId()).style.visibility = 'hidden';
        }
    }, {
        key: 'updateBoard',
        value: function updateBoard(moveToHighlight) {
            var boardElem = document.getElementById('board');
            var coordsToHighlight = moveToHighlight ? moveToHighlight.coords() : [];
            for (var y = 0; y < 14; y++) {
                for (var x = 0; x < 14; x++) {
                    var col = this.board.colorAt(x, y);
                    if (!col) continue;
                    var id = 'board_' + x.toString(16) + y.toString(16);
                    var cell = document.getElementById(id);
                    if (!cell) {
                        cell = document.createElement('div');
                        cell.id = id;
                        cell.setAttribute('style', 'position:absolute;' + 'left:' + x * SCALE + 'px;' + 'top:' + y * SCALE + 'px;' + 'width:' + SCALE + 'px;' + 'height:' + SCALE + 'px;');
                        boardElem.appendChild(cell);
                    }
                    var cls = col === 'violet' ? 'block0' : 'block1';
                    for (var i = 0; i < coordsToHighlight.length; i++) {
                        if (coordsToHighlight[i].x == x && coordsToHighlight[i].y == y) {
                            cls += 'highlight';
                            break;
                        }
                    }
                    cell.className = cls;
                }
            }
        }
    }, {
        key: 'updateScore',
        value: function updateScore() {
            document.getElementById('violet-score').innerHTML = this.board.score(0) + ' points';
            document.getElementById('orange-score').innerHTML = this.board.score(1) + ' points';
        }
    }, {
        key: 'update',
        value: function update(moveToHighlight) {
            this.updateBoard(moveToHighlight);
            this.updateScore();
        }
    }, {
        key: 'setActiveArea',
        value: function setActiveArea() {
            var p = this.board.player() ^ this.player;
            var classes = ['active-area', 'inactive-area'];
            document.getElementById('piece-area').className = classes[p];
            document.getElementById('opponents-piece-area').className = classes[1 - p];
            document.getElementById('pieces').className = p == 0 ? 'active' : '';
        }
    }, {
        key: 'showOpponentsPlaying',
        value: function showOpponentsPlaying(show) {
            if (show) this.showMessage(['Orange', 'Violet'][this.player] + ' plays');else this.hideMessage();
        }
    }, {
        key: 'showGameEndMessage',
        value: function showGameEndMessage(shouldShowScore) {
            var msg = '';
            if (shouldShowScore) msg = '<span style="color:#63d">' + this.board.score(0) + '</span> - <span style="color:#f72">' + this.board.score(1) + '</span> ';
            var myScore = this.board.score(this.player);
            var yourScore = this.board.score(this.player ^ 1);
            if (myScore > yourScore) {
                msg += 'You win!';
            } else if (myScore < yourScore) {
                msg += 'You lose...';
            } else {
                msg += 'Draw';
            }
            this.showMessage(msg);
        }
    }, {
        key: 'showMessage',
        value: function showMessage(msg) {
            var elem = document.getElementById('message');
            elem.innerHTML = msg;
            elem.style.visibility = 'visible';
        }
    }, {
        key: 'hideMessage',
        value: function hideMessage() {
            document.getElementById('message').style.visibility = 'hidden';
        }
    }]);
    return View;
}();

var mqFullsize = window.matchMedia('(min-width: 580px)');
var Input = function () {
    function Input(board, player, onPlayerMove) {
        classCallCheck(this, Input);

        this.board = board;
        this.player = player;
        this.onPlayerMove = onPlayerMove;
        this.touchDragHandler = this.touchDrag.bind(this);
    }

    createClass(Input, [{
        key: 'rotate',
        value: function rotate(elem, dir, x, y) {
            function setClass(name) {
                elem.classList.add(name);
                setTimeout(function () {
                    return elem.classList.remove(name);
                }, 16);
            }
            switch (dir) {
                case 'left':
                    dir = elem.direction + [6, 2][elem.direction & 1] & 7;
                    setClass('rotate-left');
                    break;
                case 'right':
                    dir = elem.direction + [2, 6][elem.direction & 1] & 7;
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
            var rot = blockSet[elem.blockId].rotations[dir];
            for (var i = 0; i < rot.size; i++) {
                var child = elem.childNodes[i];
                child.style.left = rot.coords[i].x * SCALE + 'px';
                child.style.top = rot.coords[i].y * SCALE + 'px';
            }
            if (x != undefined) {
                elem.style.left = x - SCALE / 2 + 'px';
                elem.style.top = y - SCALE / 2 + 'px';
            }
        }
    }, {
        key: 'toBoardPosition',
        value: function toBoardPosition(x, y) {
            var boardStyle = window.getComputedStyle(document.getElementById('board'));
            x -= parseInt(boardStyle.left) + parseInt(boardStyle.borderLeftWidth);
            y -= parseInt(boardStyle.top) + parseInt(boardStyle.borderTopWidth);
            x = Math.round(x / SCALE);
            y = Math.round(y / SCALE);
            if (this.board.inBounds(x, y)) return { x: x, y: y };else return null;
        }
    }, {
        key: 'fromBoardPosition',
        value: function fromBoardPosition(pos) {
            var boardStyle = window.getComputedStyle(document.getElementById('board'));
            return {
                x: pos.x * SCALE + parseInt(boardStyle.left) + parseInt(boardStyle.borderLeftWidth),
                y: pos.y * SCALE + parseInt(boardStyle.top) + parseInt(boardStyle.borderTopWidth)
            };
        }
    }, {
        key: 'createPiece',
        value: function createPiece(x, y, id, dir) {
            var elem = document.getElementById('b' + id);
            if (elem) {
                elem.style.left = x + 'px';
                elem.style.top = y + 'px';
                this.rotate(elem, dir);
                return;
            }
            // create a new piece
            elem = document.createElement('div');
            elem.id = 'b' + id;
            elem.blockId = id;
            elem.direction = dir;
            elem.classList.add('piece');
            elem.setAttribute('style', 'left:' + x + 'px;' + 'top:' + y + 'px;' + 'position:absolute;');
            var piece = blockSet[id].rotations[dir].piece;
            for (var i = 0; i < piece.size; i++) {
                var cell = document.createElement('div');
                cell.setAttribute('style', 'position:absolute;' + 'left:' + piece.coords[i].x * SCALE + 'px;' + 'top:' + piece.coords[i].y * SCALE + 'px;' + 'width:' + SCALE + 'px;' + 'height:' + SCALE + 'px;');
                cell.className = 'block' + this.player;
                elem.appendChild(cell);
            }
            if (mqFullsize.matches) {
                // set event handlers
                elem.onmousedown = this.mouseDrag.bind(this);
                if (elem.addEventListener) elem.addEventListener('touchstart', this.touchDrag.bind(this), false);
                elem.onclick = this.click.bind(this);
                elem.ondblclick = this.dblclick.bind(this);
                elem.onmousewheel = this.wheel.bind(this);
                if (elem.addEventListener) elem.addEventListener('DOMMouseScroll', this.wheel.bind(this), false); // for FF
            } else {
                elem.classList.add('unselected');
                elem.onclick = this.select.bind(this);
            }
            document.getElementById('pieces').appendChild(elem);
        }
    }, {
        key: 'createPieces',
        value: function createPieces() {
            var area = window.getComputedStyle(document.getElementById('piece-area'));
            var left = parseInt(area.left) + parseInt(area.paddingLeft);
            var top = parseInt(area.top) + parseInt(area.paddingTop);
            for (var i = 0; i < piecePositionTable.length; i++) {
                var a = piecePositionTable[i];
                if (!this.board.isUsed(this.player, i)) {
                    if (mqFullsize.matches) this.createPiece(left + a[0] * SCALE, top + a[1] * SCALE, i, a[2]);else this.createPiece(left + a[0] * SCALE / 2 - SCALE / 4, top + a[1] * SCALE / 2 - SCALE / 4, i, a[2]);
                }
            }
        }
    }, {
        key: 'wheel',
        value: function wheel(e) {
            var _this = this;

            e.stopPropagation();
            e.preventDefault();
            if (this.wheel_lock) return;
            this.wheel_lock = true;
            setTimeout(function () {
                _this.wheel_lock = false;
            }, 50);
            if (this.board.player() != this.player) return;
            var raw = e.detail ? e.detail : -e.wheelDelta;

            var _containerOffset = containerOffset(e),
                x = _containerOffset.x,
                y = _containerOffset.y;

            if (raw < 0) this.rotate(e.currentTarget, 'left', x, y);else this.rotate(e.currentTarget, 'right', x, y);
        }
    }, {
        key: 'select',
        value: function select(e) {
            if (this.board.player() != this.player) return;
            var elem = e.currentTarget;
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

    }, {
        key: 'unselect',
        value: function unselect() {
            if (!this.selected) return;
            this.selected.classList.remove('selected');
            this.selected.classList.add('unselected');
            this.selected.onclick = this.select.bind(this);
            this.selected.removeEventListener('touchstart', this.touchDragHandler, false);
            this.selected = null;
            this.createPieces();
        }
    }, {
        key: 'click',
        value: function click(e) {
            if (mqFullsize.matches && !e.shiftKey) return;
            if (this.board.player() != this.player) return;

            var _containerOffset2 = containerOffset(e),
                x = _containerOffset2.x,
                y = _containerOffset2.y;

            this.rotate(e.currentTarget, mqFullsize.matches ? 'right' : 'cyclic', x, y);
        }
        // For full-size mode

    }, {
        key: 'dblclick',
        value: function dblclick(e) {
            if (e.shiftKey) return;
            if (this.board.player() != this.player) return;

            var _containerOffset3 = containerOffset(e),
                x = _containerOffset3.x,
                y = _containerOffset3.y;

            this.rotate(e.currentTarget, 'flip', x, y);
        }
    }, {
        key: 'mouseDrag',
        value: function mouseDrag(e) {
            if (this.board.player() != this.player) return;
            this.dragCommon(e, e.clientX, e.clientY);
        }
    }, {
        key: 'touchDrag',
        value: function touchDrag(e) {
            if (this.board.player() != this.player) return;
            if (e.targetTouches.length != 1) return;
            var clientX = e.targetTouches[0].clientX;
            var clientY = e.targetTouches[0].clientY;
            this.dragCommon(e, clientX, clientY);
        }
    }, {
        key: 'dragCommon',
        value: function dragCommon(e, clientX, clientY) {
            var _this2 = this;

            var elem = e.currentTarget;
            var deltaX = clientX - elem.offsetLeft;
            var deltaY = clientY - elem.offsetTop;
            var touchClick = true;
            if (!mqFullsize.matches) {
                var touchTime = new Date().getTime();
                elem.lastClientX = elem.lastClientY = null;
            }
            elem.classList.add('dragging');
            e.stopPropagation();
            e.preventDefault();
            var moveHandler = function moveHandler(e, clientX, clientY) {
                e.stopPropagation();
                var x = clientX - deltaX;
                var y = clientY - deltaY;
                var bpos = _this2.toBoardPosition(x, y);
                var pieceId = elem.blockId << 3 | elem.direction;
                if (bpos && _this2.board.isValidMove(new Move(bpos.x, bpos.y, pieceId))) {
                    var epos = _this2.fromBoardPosition(bpos);
                    elem.style.left = epos.x + 'px';
                    elem.style.top = epos.y + 'px';
                } else {
                    elem.style.left = x + 'px';
                    elem.style.top = y + 'px';
                }
            };
            var mouseMove = function mouseMove(e) {
                moveHandler(e, e.clientX, e.clientY);
            };
            var touchMove = function touchMove(e) {
                if (e.targetTouches.length != 1) return;
                var clientX = e.targetTouches[0].clientX;
                var clientY = e.targetTouches[0].clientY;
                elem.lastClientX = clientX;
                elem.lastClientY = clientY;
                touchClick = false;
                moveHandler(e, clientX, clientY);
            };
            var upHandler = function upHandler(e, clientX, clientY) {
                document.removeEventListener('mouseup', mouseUp, true);
                document.removeEventListener('mousemove', mouseMove, true);
                elem.removeEventListener('touchend', touchEnd, false);
                elem.removeEventListener('touchmove', touchMove, false);
                e.stopPropagation();
                if (!mqFullsize.matches) elem.classList.remove('dragging');
                var bpos = _this2.toBoardPosition(clientX - deltaX, clientY - deltaY);
                if (bpos) {
                    var move = new Move(bpos.x, bpos.y, elem.blockId << 3 | elem.direction);
                    if (_this2.board.isValidMove(move)) {
                        elem.style.visibility = 'hidden';
                        _this2.onPlayerMove(move);
                    }
                } else if (!mqFullsize.matches && clientX && clientY) {
                    var x = clientX - deltaX;
                    var y = clientY - deltaY;
                    if (x < 20 || x > 280 || y < 10 || y > 340) _this2.unselect();
                }
            };
            var mouseUp = function mouseUp(e) {
                upHandler(e, e.clientX, e.clientY);
            };
            var touchEnd = function touchEnd(e) {
                if (e.targetTouches.length > 0) return;
                var clientX = elem.lastClientX;
                var clientY = elem.lastClientY;
                if (touchClick) {
                    _this2.rotate(elem, 'cyclic');
                } else if (!mqFullsize.matches) {
                    var elapsed = new Date().getTime() - touchTime;
                    if (elapsed < 100) _this2.rotate(elem, 'cyclic');
                }
                upHandler(e, clientX, clientY);
            };
            document.addEventListener('mousemove', mouseMove, true);
            document.addEventListener('mouseup', mouseUp, true);
            elem.addEventListener('touchmove', touchMove, false);
            elem.addEventListener('touchend', touchEnd, false);
        }
    }]);
    return Input;
}();
function containerOffset(e) {
    var offsetParent = e.currentTarget.offsetParent;
    var x = e.pageX - offsetParent.offsetLeft;
    var y = e.pageY - offsetParent.offsetTop;
    return { x: x, y: y };
}
// For IE
if (!window.TouchEvent) {
    window.TouchEvent = function () {};
}

var WorkerBackend = function () {
    function WorkerBackend(handler) {
        var _this = this;

        classCallCheck(this, WorkerBackend);

        this.handler = handler;
        this.worker = new Worker('dist/hm5move.js');
        this.worker.addEventListener('message', function (e) {
            var move = new Move(e.data.move);
            console.log(e.data.nps + ' nps');
            _this.handler(move);
        });
    }

    createClass(WorkerBackend, [{
        key: 'request',
        value: function request(path, level) {
            this.worker.postMessage({ path: path, level: level });
        }
    }]);
    return WorkerBackend;
}();

var toolBarClosingTimer = void 0;
function openToolBar() {
    var toolbar = document.getElementById('toolbar');
    toolbar.classList.remove('closed');
    toolBarClosingTimer = setTimeout(closeToolBar, 5000);
}
function closeToolBar() {
    var toolbar = document.getElementById('toolbar');
    toolbar.classList.add('closed');
    clearTimeout(toolBarClosingTimer);
    toolBarClosingTimer = null;
}
function help() {
    var help = document.getElementById('help');
    help.classList.remove('closed');
    var toolbar = document.getElementById('toolbar');
    toolbar.classList.add('closed');
}
function reload() {
    window.location.reload();
}
function closeHelp() {
    var help = document.getElementById('help');
    help.classList.add('closed');
}
var handler = document.getElementById('handler');
handler.addEventListener('click', openToolBar);
document.getElementById('reloadButton').addEventListener('click', reload);
document.getElementById('helpButton').addEventListener('click', help);
document.getElementById('closeButton').addEventListener('click', closeToolBar);
document.getElementById('closeHelp').addEventListener('click', closeHelp);

var Blokus = function () {
    function Blokus() {
        classCallCheck(this, Blokus);

        this.level = 1;
    }

    createClass(Blokus, [{
        key: 'start',
        value: function start(player) {
            this.board = new Board();
            this.player = player;
            this.view = new View(this.board, player);
            this.input = new Input(this.board, this.player, this.onPlayerMove.bind(this));
            this.backend = new WorkerBackend(this.onOpponentMove.bind(this));
            this.startGame();
            if (player == 1) this.opponentMove();
        }
    }, {
        key: 'resume',
        value: function resume(path) {
            this.board = new Board(path);
            this.player = this.board.player();
            this.view = new View(this.board, this.player);
            this.input = new Input(this.board, this.player, this.onPlayerMove.bind(this));
            this.backend = new WorkerBackend(this.onOpponentMove.bind(this));
            // FIXME
            // this.startGame(path);
        }
    }, {
        key: 'onPlayerMove',
        value: function onPlayerMove(move) {
            this.board.doMove(move);
            this.opponentMove();
            this.view.onPlayerMove();
        }
    }, {
        key: 'opponentMove',
        value: function opponentMove() {
            this.view.startOpponentMove();
            this.backend.request(this.board.getPath(), this.level);
        }
    }, {
        key: 'onOpponentMove',
        value: function onOpponentMove(move) {
            this.board.doMove(move);
            this.view.onOpponentMove(move);
            this.input.createPieces();
            // window.location.replace('#' + this.board.getPath());
            if (!this.board.canMove()) {
                if (move.isPass()) this.gameEnd();else {
                    this.board.doPass();
                    this.opponentMove();
                }
            }
        }
    }, {
        key: 'gameEnd',
        value: function gameEnd() {
            this.view.gameEnd(!mqFullsize.matches);
            if (!mqFullsize.matches) this.player = null;
        }
    }, {
        key: 'startGame',
        value: function startGame() {
            document.getElementById('start-game').style.visibility = 'hidden';
            this.input.createPieces();
            this.view.startGame();
        }
    }]);
    return Blokus;
}();

var blokus = new Blokus();
window.addEventListener('load', function () {
    var path = window.location.hash.substring(1);
    if (path) blokus.resume(path);
});
function startButton(player) {
    blokus.start(player);
}
document.getElementById('start-violet').addEventListener('click', function () {
    return startButton(0);
});
document.getElementById('start-orange').addEventListener('click', function () {
    return startButton(1);
});
function setLevel(lv) {
    blokus.level = lv;
}
document.getElementById('level1').addEventListener('click', function () {
    return setLevel(1);
});
document.getElementById('level2').addEventListener('click', function () {
    return setLevel(2);
});
document.getElementById('level3').addEventListener('click', function () {
    return setLevel(3);
});

return blokus;

}());
