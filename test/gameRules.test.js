import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findNextTarget,
  lettersForLevel,
  levelForScore,
  normalizeTypedKey,
} from '../src/js/gameRules.js';

test('normalizes only printable single-character input', () => {
  assert.equal(normalizeTypedKey('f'), 'F');
  assert.equal(normalizeTypedKey(';'), ';');
  assert.equal(normalizeTypedKey('Enter'), '');
  assert.equal(normalizeTypedKey(''), '');
});

test('scales levels every 500 points', () => {
  assert.equal(levelForScore(0), 1);
  assert.equal(levelForScore(499), 1);
  assert.equal(levelForScore(500), 2);
  assert.equal(levelForScore(1500), 4);
});

test('returns a copy of the appropriate letter set', () => {
  const levelTwo = lettersForLevel(2);
  assert.deepEqual(levelTwo, ['F', 'J', 'D', 'K']);
  levelTwo.push('X');
  assert.deepEqual(lettersForLevel(2), ['F', 'J', 'D', 'K']);
  assert.deepEqual(lettersForLevel(99), ['F', 'J', 'D', 'K', 'S', 'L', 'A', ';']);
});

test('selects the nearest eligible target in queue order', () => {
  const boxes = [
    { completed: true, box: { position: { x: 4 } } },
    { completed: false, box: { position: { x: 8 } } },
    { completed: false, box: { position: { x: 22 } } },
  ];
  assert.equal(findNextTarget(boxes, -7), boxes[1]);
  assert.equal(findNextTarget(boxes, 0), boxes[1]);
  assert.equal(findNextTarget(boxes, 8), boxes[2]);
  assert.equal(findNextTarget(boxes, 10), boxes[2]);
});
