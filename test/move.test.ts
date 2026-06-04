import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Move, PASS } from '../src/move.ts';

test('Move', () => {
  assert.ok(PASS.isPass());
  assert.ok(new Move('0000').isPass());

  const m = new Move(3, 5, 0x12);
  assert.equal(m.x(), 3);
  assert.equal(m.y(), 5);
  assert.equal(m.pieceId(), 0x12);
  assert.equal(m.blockId(), 2);
  assert.equal(m.direction(), 2);
  assert.ok(!m.isPass());
  assert.equal(m.fourcc(), '46s2');

  const m2 = new Move('46s2');
  assert.equal(m2.x(), 3);
  assert.equal(m2.y(), 5);
  assert.equal(m2.pieceId(), 0x12);
  assert.equal(m2.fourcc(), '46s2');
});
