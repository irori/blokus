var scale = 20

function rotate(elem, dir, x, y) {
    elem.direction = dir;
    var rot = blockSet[elem.blockId].rotations[dir];
    var piece = rot.piece;
    for (var i = 0; i < piece.size; i++) {
	elem.childNodes[i].style.left =
	    (rot.offsetX + piece.coords[i][0]) * scale + "px";
	elem.childNodes[i].style.top =
	    (rot.offsetY + piece.coords[i][1]) * scale + "px";
    }
    elem.style.left = x - scale / 2 + "px";
    elem.style.top = y - scale / 2 + "px";
}

function wheel(e) {
    var raw = e.detail ? e.detail : -e.wheelDelta;
    var x = e.clientX + window.pageXOffset;
    var y = e.clientY + window.pageYOffset;
    if (raw < 0)
	rotate(this, (this.direction + 6) & 7, x, y);
    else
	rotate(this, (this.direction + 2) & 7, x, y);
    e.stopPropagation();
    e.preventDefault();
}

function click(e) {
    if (e.detail % 2 == 0) {
	var x = e.clientX + window.pageXOffset;
	var y = e.clientY + window.pageYOffset;
	rotate(this, this.direction ^ 1, x, y);
    }
}

function createPiece(x, y, id, dir) {
    var elem = document.createElement("div");
    elem.blockId = id;
    elem.direction = dir;
    elem.setAttribute("style",
		      "left:" + x * scale + "px;" +
		      "top:" + y * scale + "px;" +
		      "position:absolute;")
    piece = blockSet[id].rotations[dir].piece;
    for (var i = 0; i < piece.size; i++) {
	var cell = document.createElement("div");
	cell.setAttribute("style",
			  "position:absolute;" +
			  "left:" + piece.coords[i][0] * scale + "px;" +
			  "top:" + piece.coords[i][1] * scale + "px;" +
			  "width:" + scale + "px;" +
			  "height:" + scale + "px;");
	cell.className = "block" + Blokus.board.player();
	elem.appendChild(cell);
    }
    elem.addEventListener("mousedown", function(e){drag(elem, e)}, false);
    elem.addEventListener("DOMMouseScroll", wheel, false);
    elem.addEventListener("mousewheel", wheel, false);
    elem.addEventListener("click", click, false);
    document.body.appendChild(elem);
}

function createPieces() {
    var table = [ // x, y, dir
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
	[25, 9, 0], // a
    ];
    var left = 2;
    var top = 20;

    for (var i = 0; i < table.length; i++) {
	var a = table[i];
	if (!Blokus.board.isUsed(Blokus.board.player(), i))
	    createPiece(left + a[0], top + a[1], i, a[2]);
    }
}

function createOpponentsPieces() {
    var table = [ //x, y, dir
	[1, 1, 0], // u
	[1, 5, 0], // t
	[1, 9, 0], // s
	[1, 13, 0], // r
	[0, 17, 0], // q
	[1, 20, 0], // p
	[4, 1, 0], // o
	[1, 24, 2], // n
	[1, 27, 2], // m
	[5, 7, 0], // l
	[5, 12, 0], // k
	[5, 17, 0], // j
	[1, 29, 0], // i
	[4, 21, 0], // h
	[1, 32, 2], // g
	[1, 36, 2], // f
	[5, 25, 0], // e
	[4, 30, 0], // d
	[5, 33, 0], // c
	[5, 36, 2], // b
	[3, 34, 0], // a
    ];

    for (var id = 0; id < table.length; id++) {
	var a = table[id];
	if (Blokus.board.isUsed(1 - Blokus.board.player(), id))
	    continue;

	var x = 8 + a[0];
	var y = 8 + a[1];
	var dir = a[2];
	var s = scale * 3 >> 3;

	var elem = document.createElement("div");
	elem.setAttribute("style",
			  "left:" + x * s + "px;" +
			  "top:" + y * s + "px;" +
			  "position:absolute;")
	piece = blockSet[id].rotations[dir].piece;
	for (var i = 0; i < piece.size; i++) {
	    var cell = document.createElement("div");
	    cell.setAttribute("style",
			      "position:absolute;" +
			      "left:" + piece.coords[i][0] * s + "px;" +
			      "top:" + piece.coords[i][1] * s + "px;" +
			      "width:" + s + "px;" +
			      "height:" + s + "px;");
	    cell.className = "block" + (1 - Blokus.board.player());
	    elem.appendChild(cell);
	}
	document.body.appendChild(elem);
    }
}

function updateBoardView() {
    boardElem = document.getElementById("board");
    for (var y = 0; y < 14; y++) {
	for (var x = 0; x < 14; x++) {
	    var sq = Blokus.board.at(x, y);
	    if ((sq & (Board.VIOLET_BLOCK | Board.ORANGE_BLOCK)) == 0)
		continue;
	    var id = "board_" + x.toString(16) + y.toString(16);
	    if (document.getElementById(id))
		continue;
	    var cell = document.createElement("div");
	    cell.id = id;
	    cell.setAttribute("style",
			      "position:absolute;" +
			      "left:" + x * scale + "px;" +
			      "top:" + y * scale + "px;" +
			      "width:" + scale + "px;" +
			      "height:" + scale + "px;");
	    cell.className = (sq & Board.VIOLET_BLOCK) ? "block0" : "block1";
	    boardElem.appendChild(cell);
	}
    }
}

function createBoard(state) {
    board = new Board();
    if (state) {
	var moves = state.split("/");
	for (var i = 0; i < moves.length; i++) {
	    var move = new Move(moves[i]);
	    if (board.isValidMove(move))
		board.doMove(move)
	    else
		throw new Error("invalid move: " + move.fourcc());
	}
    }
    return board;
}

Blokus = {}

function initBlokus() {
    Blokus.board = createBoard(window.location.hash.substring(1));
    createPieces();
    createOpponentsPieces();
    updateBoardView();
}
