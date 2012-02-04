
test("Move", function(){
    ok(Move.PASS.isPass());
    ok((new Move("----")).isPass());
    var m = new Move(3, 5, 0x12);
    same(m.x(), 3);
    same(m.y(), 5);
    same(m.pieceId(), 0x12);
    same(m.blockId(), 2);
    same(m.direction(), 2);
    ok(!m.isPass());
    same(m.fourcc(), "46s2");
    same((new Move("46s2")).m, m.m);
    same((new Move(4661)).m, 4661);
});

test("Board constructor", function(){
    var b = new Board();
    for (var y = 0; y < 14; y++) {
	for (var x = 0; x < 14; x++) {
	    if (x == 4 && y == 4)
		same(b.at(x, y), Board.VIOLET_EDGE);
	    else if (x == 9 && y == 9)
		same(b.at(x, y), Board.ORANGE_EDGE);
	    else
		same(b.at(x, y), 0);
	}
    }
    same(b.history.length, 0);
    same(b.player(), 0);
    for (var p = 0; p < 2; p++) {
	for (var i = 0; i < 21; i++)
	    ok(!b.isUsed(p, i));
    }
    same(b.score(0), 0);
    same(b.score(1), 0);
    ok(b.canMove());
});

test("first move", function(){
    var b = new Board();
    ok(b.isValidMove(new Move("----")));
    ok(b.isValidMove(new Move("66t0")));
    ok(b.isValidMove(new Move("55t0")));
    ok(!b.isValidMove(new Move("44t0")));
    ok(!b.isValidMove(new Move("AAt0")));
    ok(b.isValidMove(new Move("55u0")));
    ok(b.isValidMove(new Move("55a0")));
    ok(b.isValidMove(new Move("66t3")));
    ok(!b.isValidMove(new Move("65t6")));

    b.doMove(new Move("66t0"));
    same(b.history.length, 1);
    same(b.getPath(), "66t0");
    same(b.player(), 1);
    ok(b.isUsed(0, 1));
    ok(!b.isUsed(1, 1));
    same(b.score(0), 5);
    same(b.score(1), 0);
    ok(b.canMove());
    ok(b.isValidMove(new Move("AAt0")));
    ok(!b.isValidMove(new Move("55u0")));
});

test("fourth move", function(){
    var b = new Board();
    b.doMove(new Move("55t6"));
    b.doMove(new Move("99t4"));
    b.doMove(new Move("78l5"));

    same(b.getPath(), "55t6/99t4/78l5");
    same(b.player(), 1);
    same(b.score(0), 10);
    same(b.score(1), 5);
    ok(b.canMove());
    ok(b.isValidMove(new Move("7Bo3")));
    ok(!b.isValidMove(new Move("7Aa0")));
});

test("end game", function(){
    var b = new Board();
    function checkMove(m) {
	if (m.isPass())
	    ok(!b.canMove(), "cannot move");
	else
	    ok(b.canMove(), "can move");
	ok(b.isValidMove(m), m.fourcc() + " is a valid move");
	b.doMove(m);
    }
    checkMove(new Move("55t6"));
    checkMove(new Move("99t4"));
    checkMove(new Move("78l5"));
    checkMove(new Move("7Bo3"));
    checkMove(new Move("5Ao1"));
    checkMove(new Move("A5k4"));
    checkMove(new Move("8Dj2"));
    checkMove(new Move("82l6"));
    checkMove(new Move("CBr1"));
    checkMove(new Move("33q2"));
    checkMove(new Move("28q0"));
    checkMove(new Move("C7r2"));
    checkMove(new Move("E7e0"));
    checkMove(new Move("75p0"));
    checkMove(new Move("D4u0"));
    checkMove(new Move("B2s0"));
    checkMove(new Move("14m4"));
    checkMove(new Move("47f6"));
    checkMove(new Move("42n2"));
    checkMove(new Move("39m7"));
    checkMove(new Move("2Bs0"));
    checkMove(new Move("E1d3"));
    checkMove(new Move("3Ek2"));
    checkMove(new Move("4Bb0"));
    checkMove(new Move("B3b2"));
    checkMove(new Move("11h0"));
    checkMove(new Move("DDp0"));
    checkMove(new Move("17c0"));
    checkMove(new Move("84h0"));
    checkMove(new Move("5Da0"));
    checkMove(new Move("B6g0"));
    checkMove(new Move("8Ej2"));
    checkMove(new Move("81f6"));
    checkMove(new Move("----"));
    checkMove(new Move("63a0"));
    checkMove(new Move("----"));
    ok(!b.canMove());
});
