import test from 'node:test';
import assert from 'node:assert/strict';

function calculateAdherence(totalDoses, takenDoses) {
  if (!totalDoses || totalDoses <= 0) return 0;
  return Math.round((takenDoses / totalDoses) * 100);
}

function isValidCarePasscode(code) {
  return /^\d{6}$/.test(String(code || ''));
}

test('calculateAdherence computes accurate percentage', () => {
  assert.equal(calculateAdherence(6, 0), 0);
  assert.equal(calculateAdherence(6, 3), 50);
  assert.equal(calculateAdherence(6, 6), 100);
});

test('isValidCarePasscode validates 6-digit linking code', () => {
  assert.equal(isValidCarePasscode('482910'), true);
  assert.equal(isValidCarePasscode('1234'), false);
  assert.equal(isValidCarePasscode('abcdef'), false);
});
