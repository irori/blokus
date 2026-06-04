import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Move } from '../src/move.ts';
import { Board } from '../src/board.ts';

test('Board constructor', () => {
  const b = new Board();
  assert.equal(b.turn(), 0);
  assert.equal(b.player(), 0);
  for (let p = 0; p < 2; p++) {
    for (let i = 0; i < 21; i++)
      assert.ok(!b.isUsed(p, i));
  }
  assert.equal(b.score(0), 0);
  assert.equal(b.score(1), 0);
  assert.ok(b.canMove());
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 14; x++)
      assert.equal(b.colorAt(x, y), null);
  }
});

test('first move', () => {
  const b = new Board();
  assert.ok(b.isValidMove(new Move('0000')));
  assert.ok(b.isValidMove(new Move('66t0')));
  assert.ok(b.isValidMove(new Move('55t0')));
  assert.ok(!b.isValidMove(new Move('44t0')));
  assert.ok(!b.isValidMove(new Move('AAt0')));
  assert.ok(b.isValidMove(new Move('55u0')));
  assert.ok(b.isValidMove(new Move('55a0')));
  assert.ok(b.isValidMove(new Move('66t3')));
  assert.ok(!b.isValidMove(new Move('65t6')));

  b.doMove(new Move('66t0'));
  assert.equal(b.turn(), 1);
  assert.equal(b.getPath(), '66t0');
  assert.equal(b.player(), 1);
  assert.ok(b.isUsed(0, 1));
  assert.ok(!b.isUsed(1, 1));
  assert.equal(b.score(0), 5);
  assert.equal(b.score(1), 0);
  assert.ok(b.canMove());
  assert.ok(b.isValidMove(new Move('AAt0')));
  assert.ok(!b.isValidMove(new Move('55u0')));
});

test('fourth move', () => {
  const b = new Board();
  b.doMove(new Move('55t6'));
  b.doMove(new Move('99t4'));
  b.doMove(new Move('78l5'));

  assert.equal(b.getPath(), '55t6/99t4/78l5');
  assert.equal(b.player(), 1);
  assert.equal(b.score(0), 10);
  assert.equal(b.score(1), 5);
  assert.ok(b.canMove());
  assert.ok(b.isValidMove(new Move('7Bo3')));
  assert.ok(!b.isValidMove(new Move('7Aa0')));
});

test('end game', () => {
  const b = new Board();
  const moves = [
    '55t6', '99t4', '78l5', '7Bo3', '5Ao1', 'A5k4', '8Dj2', '82l6',
    'CBr1', '33q2', '28q0', 'C7r2', 'E7e0', '75p0', 'D4u0', 'B2s0',
    '14m4', '47f6', '42n2', '39m7', '2Bs0', 'E1d3', '3Ek2', '4Bb0',
    'B3b2', '11h0', 'DDp0', '17c0', '84h0', '5Da0', 'B6g0', '8Ej2',
    '81f6', '0000', '63a0', '0000',
  ];
  for (const code of moves) {
    const m = new Move(code);
    if (m.isPass())
      assert.ok(!b.canMove(), `cannot move at ${code}`);
    else
      assert.ok(b.canMove(), `can move at ${code}`);
    assert.ok(b.isValidMove(m), `${code} is a valid move`);
    b.doMove(m);
  }
  assert.ok(!b.canMove());
});
