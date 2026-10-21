const test = require('node:test');
const assert = require('node:assert/strict');
const { cardPoints, createCardSet, createRun, enterRoom, elementalModifier, generateElementalMonster, monsterFromCard, outcomeForRoll, resolveRoom, runSimulation } = require('../src/engine');

test('MVP card set contains 48 playing cards and four elemental jokers', () => {
  const cards = createCardSet();
  assert.equal(cards.length, 52);
  assert.equal(cards.filter((card) => card.type === 'joker').length, 4);
  assert.equal(cards.filter((card) => card.rank === '10').length, 0);
  assert.equal(cards.filter((card) => card.cardBack === 'royal').length, 12);
});

test('same seed produces the same initial run', () => {
  const input = { seed: 1001, character: { name: 'Aeris', class: 'elf', element: 'air' } };
  assert.deepEqual(createRun(input), createRun(input));
});

test('run starts with a 3x3 map, three health, and two cards', () => {
  const run = createRun({ seed: 1001, character: { name: 'Aeris', class: 'elf', element: 'air' } });
  assert.equal(run.rooms.length, 9);
  assert.equal(run.character.health, 3);
  assert.equal(run.hand.length, 2);
  assert.equal(run.handLimit, 7);
});

test('event dice map to monster, trap, and treasure bands', () => {
  assert.equal(outcomeForRoll(1), 'monster');
  assert.equal(outcomeForRoll(2), 'monster');
  assert.equal(outcomeForRoll(3), 'trap');
  assert.equal(outcomeForRoll(4), 'trap');
  assert.equal(outcomeForRoll(5), 'treasure');
  assert.equal(outcomeForRoll(6), 'treasure');
});

test('entering a room reveals one deterministic event', () => {
  const run = createRun({ seed: 2002, character: { name: 'Brann', class: 'warrior', element: 'fire' } });
  const room = enterRoom(run, 0, 0);
  assert.equal(room.revealed, true);
  assert.ok(['monster', 'trap', 'treasure'].includes(room.event.type));
  assert.equal(enterRoom(run, 0, 0).repeated, true);
});

test('card PV tiers and elemental advantage follow Phase 1 rules', () => {
  assert.equal(cardPoints({ type: 'playing-card', rank: 'A' }), 1);
  assert.equal(cardPoints({ type: 'playing-card', rank: '4' }), 2);
  assert.equal(cardPoints({ type: 'playing-card', rank: '7' }), 3);
  assert.equal(elementalModifier('water', 'fire'), 1);
  assert.equal(elementalModifier('fire', 'water'), -1);
});

test('a committed card can clear a barrier and is removed from the hand', () => {
  const run = createRun({ seed: 2002, character: { name: 'Brann', class: 'warrior', element: 'fire' } });
  const room = enterRoom(run, 0, 0);
  const committed = run.hand[0];
  const before = run.hand.length;
  resolveRoom(run, 0, 0, { cardIds: [committed.id], elementRoll: 1, valueRoll: 6 });
  assert.equal(run.hand.length, before - 1);
  assert.ok(['cleared', 'failed', 'dead'].includes(room.event.status));
  assert.ok(room.event.resolution);
});

test('simulation is bounded and deterministic in shape', () => {
  const report = runSimulation({ count: 3, seed: 1001 });
  assert.equal(report.count, 3);
  assert.equal(report.results.length, 3);
  assert.equal(report.completed + report.failed, 3);
});

test('monster generation is deterministic and card-driven', () => {
  const card = { id: '3-clubs', type: 'playing-card', rank: '3', suit: 'clubs' };
  const first = monsterFromCard(card, 1001);
  assert.deepEqual(first, monsterFromCard(card, 1001));
  assert.equal(first.element, 'fire');
  assert.equal(first.size, 3);
  assert.equal(first.sourceCard.rank, '3');
  const boss = generateElementalMonster({ seed: 2, element: 'earth', category: 'constructs-golems', rank: 'K' });
  assert.equal(boss.health, 3);
  assert.equal(boss.element, 'earth');
});

test('items and traps are generated from JSON content tables', () => {
  const item = require('../src/engine').generateItem({ seed: 7, rank: 4, element: 'water' });
  const trap = require('../src/engine').generateTrap({ seed: 7, rank: 8, element: 'earth' });
  assert.equal(item.type, 'item');
  assert.equal(item.rank, 4);
  assert.equal(item.element, 'water');
  assert.equal(item.power, 4);
  assert.equal(trap.type, 'trap');
  assert.equal(trap.rank, 8);
  assert.equal(trap.category, 'surge');
  assert.equal(trap.resistance, 8);
});
