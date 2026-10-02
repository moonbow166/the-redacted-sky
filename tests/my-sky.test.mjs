import assert from 'node:assert/strict';
import test from 'node:test';
import { emptySky, sanitizeSky, toggleClue, connectClues, disconnectClues, pairKey } from '../lib/my-sky-state.mjs';
const ids = ['film', 'photo', 'audio'];

test('starts empty and keeps only selected real clues', () => {
  let sky = emptySky();
  assert.deepEqual(sky, { version: 1, ids: [], links: [] });
  assert.equal(toggleClue(sky, 'invented', ids), sky);
  sky = toggleClue(sky, 'film', ids);
  assert.deepEqual(sky.ids, ['film']);
});
test('personal links require distinct saved clues, are symmetric and update rather than duplicate', () => {
  let sky = emptySky();
  assert.equal(connectClues(sky, { a: 'film', b: 'photo', kind: 'unsure' }), sky);
  sky = toggleClue(toggleClue(sky, 'film', ids), 'photo', ids);
  assert.equal(connectClues(sky, { a: 'film', b: 'film', kind: 'unsure' }), sky);
  sky = connectClues(sky, { a: 'film', b: 'photo', kind: 'unsure' });
  sky = connectClues(sky, { a: 'photo', b: 'film', kind: 'wonder' });
  assert.equal(sky.links.length, 1);
  assert.equal(sky.links[0].kind, 'wonder');
  assert.equal(pairKey('film', 'photo'), pairKey('photo', 'film'));
  assert.deepEqual(disconnectClues(sky, 'film', 'photo').links, []);
  assert.deepEqual(disconnectClues(sky, 'film', 'photo').ids, ['film', 'photo']);
});
test('removing a clue removes its links without mutating the undo snapshot', () => {
  const before = connectClues({ version: 1, ids: [...ids], links: [] }, { a: 'film', b: 'audio', kind: 'contrast' });
  const after = toggleClue(before, 'audio', ids);
  assert.deepEqual(after.links, []);
  assert.equal(before.links.length, 1);
  assert.equal(before.ids.length, 3);
});
test('device storage is versioned, allowlisted and untrusted input cannot become a source link', () => {
  for (const value of [null, false, [], 'oops', { version: 4, ids }]) assert.deepEqual(sanitizeSky(value, ids), emptySky());
  const dirty = { version: 1, ids: ['film', 'film', 'photo', '<script>', 4], links: [
    { a: 'film', b: 'photo', kind: 'unsure', official: true },
    { a: 'photo', b: 'film', kind: 'wonder' },
    { a: 'film', b: 'film', kind: 'unsure' },
    { a: 'film', b: '<script>', kind: 'unsure' },
    { a: 'film', b: 'photo', kind: 'official' }, null,
  ] };
  assert.deepEqual(sanitizeSky(dirty, ids), { version: 1, ids: ['film', 'photo'], links: [{ a: 'film', b: 'photo', kind: 'unsure' }] });
  assert.deepEqual(sanitizeSky(JSON.parse(JSON.stringify(sanitizeSky(dirty, ids))), ids), sanitizeSky(dirty, ids));
});
