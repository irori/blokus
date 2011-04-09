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

function createPiece(x, y, name, dir) {
    var elem = document.createElement("div");
    elem.blockId = 117 - name.charCodeAt(0); // 117 is 'u'
    elem.direction = dir;
    elem.setAttribute("style",
		      "left:" + x * scale + "px;" +
		      "top:" + y * scale + "px;" +
		      "position:absolute;")
    piece = pieceSet[name + dir];
    for (var i = 0; i < piece.size; i++) {
	var cell = document.createElement("div");
	cell.setAttribute("style",
			  "position:absolute;" +
			  "left:" + piece.coords[i][0] * scale + "px;" +
			  "top:" + piece.coords[i][1] * scale + "px;" +
			  "width:" + scale + "px;" +
			  "height:" + scale + "px;" +
			  "background-color:#63d;");
	elem.appendChild(cell);
    }
    elem.addEventListener("mousedown", function(e){drag(elem, e)}, false);
    elem.addEventListener("DOMMouseScroll", wheel, false);
    elem.addEventListener("mousewheel", wheel, false);
    elem.addEventListener("click", click, false);
    document.body.appendChild(elem);
}

function createPieces() {
    var left = 2;
    var top = 20;
    createPiece(left + 1, top + 1, "u", 0);
    createPiece(left + 5, top + 1, "t", 0);
    createPiece(left + 9, top + 1, "s", 0);
    createPiece(left + 13, top + 1, "r", 0);
    createPiece(left + 16, top + 2, "q", 0);
    createPiece(left + 21, top + 1, "p", 0);
    createPiece(left + 24, top + 1, "o", 0);
    createPiece(left + 1, top + 5, "n", 0);
    createPiece(left + 4, top + 5, "m", 0);
    createPiece(left + 7, top + 5, "l", 2);
    createPiece(left + 12, top + 5, "k", 2);
    createPiece(left + 18, top + 5, "j", 2);
    createPiece(left + 23, top + 5, "i", 0);
    createPiece(left + 0, top + 8, "h", 0);
    createPiece(left + 4, top + 8, "g", 2);
    createPiece(left + 8, top + 9, "f", 2);
    createPiece(left + 13, top + 8, "e", 2);
    createPiece(left + 16, top + 9, "d", 0);
    createPiece(left + 20, top + 9, "c", 2);
    createPiece(left + 23, top + 8, "b", 0);
    createPiece(left + 25, top + 9, "a", 0);
}

function initBlokus() {
    createPieces();
}
