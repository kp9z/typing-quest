export const LETTER_SETS = [
  ['F', 'J'],
  ['F', 'J', 'D', 'K'],
  ['F', 'J', 'D', 'K', 'S', 'L'],
  ['F', 'J', 'D', 'K', 'S', 'L', 'A', ';'],
];

export function normalizeTypedKey(key) {
  if (typeof key !== 'string' || key.length !== 1) return '';
  return key.toUpperCase();
}

export function levelForScore(score) {
  return Math.floor(Math.max(0, score) / 500) + 1;
}

export function lettersForLevel(level) {
  const index = Math.min(Math.max(1, level) - 1, LETTER_SETS.length - 1);
  return [...LETTER_SETS[index]];
}

export function findNextTarget(boxes, playerX, maxDistance = 15.1) {
  return boxes.find(({ box, completed }) => {
    const distance = box.position.x - playerX;
    return !completed && distance > 0 && distance <= maxDistance;
  }) ?? null;
}

export function cameraXForRunner(playerX, startCameraX, startScreenX, visibleAdvance = 3.2) {
  return Math.max(startCameraX, playerX - (startScreenX + visibleAdvance));
}
