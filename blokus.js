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
    var table = [
	[1, 1, 0],
	[5, 1, 0],
	[9, 1, 0],
	[13, 1, 0],
	[16, 2, 0],
	[21, 1, 0],
	[24, 1, 0],
	[1, 5, 0],
	[4, 5, 0],
	[7, 5, 2],
	[12, 5, 2],
	[18, 5, 2],
	[23, 5, 0],
	[0, 8, 0],
	[4, 8, 2],
	[8, 9, 2],
	[13, 8, 2],
	[16, 9, 0],
	[20, 9, 2],
	[23, 8, 0],
	[25, 9, 0],
    ];
    var left = 2;
    var top = 20;
    for (var i = 0; i < table.length; i++) {
	var a = table[i];
	if (!Blokus.board.isUsed(Blokus.board.player(), i))
	    createPiece(left + a[0], top + a[1], i, a[2]);
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
    updateBoardView();
}
