const ELEMENTS = ['air', 'fire', 'water', 'earth'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'];
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const { CORE_CONTENT, elementForSuit, expansionContent, normalizeRank } = require('./content');
const MONSTER_CATEGORIES = Object.keys(CORE_CONTENT.monsters.categories);
const SUIT_ELEMENTS = Object.freeze(CORE_CONTENT.cards.suitElements);
const MONSTER_NAMES = Object.freeze(Object.fromEntries(MONSTER_CATEGORIES.map((category) => [category, CORE_CONTENT.monsters.categories[category].elements])));

const DEFAULT_RULES = Object.freeze({
  gridSize: 3,
  gridRows: 3,
  gridColumns: 3,
  eventDice: '1d6',
  initialHandSize: 2,
  handLimit: 7,
  startingHealth: 3,
  evolutionModifier: 2,
  barrierRequiresStrictlyHigher: true,
  allowMixedLineage: false,
  allowExtraHealth: false,
  multiplayer: false
});

const PRECOMPILED_RUNS = Object.freeze([
  { id: 'debug-air-1001', seed: 1001, character: { name: 'Aeris', class: 'elf', element: 'air', gender: 'female' } },
  { id: 'debug-fire-2002', seed: 2002, character: { name: 'Brann', class: 'warrior', element: 'fire', gender: 'male' } },
  { id: 'debug-water-3003', seed: 3003, character: { name: 'Mira', class: 'priest', element: 'water', gender: 'female' } }
]);

function hashSeed(seed) {
  const text = String(seed);
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function createRng(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, max) {
  return Math.floor(rng() * max);
}

function generateElementalMonster({ seed = 1, element, category, rank = 'A', suit, expansion = 'core' } = {}) {
  const content = expansionContent(expansion);
  const categories = Object.keys(content.monsters.categories);
  const rng = createRng(`${seed}:${element || ''}:${category || ''}:${rank}:${suit || ''}`);
  const resolvedElement = element || content.cards.suitElements[suit] || ELEMENTS[randomInt(rng, ELEMENTS.length)];
  const resolvedCategory = category || categories[randomInt(rng, categories.length)];
  const categoryData = content.monsters.categories[resolvedCategory] || content.monsters.categories[categories[0]];
  const namePool = categoryData.elements[resolvedElement] || categoryData.elements.air;
  const value = cardPoints({ type: 'playing-card', rank });
  return {
    id: `monster-${String(seed)}-${resolvedElement}-${resolvedCategory}-${rank}`,
    name: namePool[randomInt(rng, namePool.length)],
    element: resolvedElement,
    category: resolvedCategory,
    categoryLabel: categoryData.label,
    sourceCard: { rank, suit: suit || null, value },
    size: value,
    health: ['J', 'Q', 'K'].includes(rank) ? (rank === 'J' ? 1 : rank === 'Q' ? 2 : 3) : 1,
    vocabulary: namePool
  };
}

function monsterFromCard(card, seed = 1, expansion = 'core') {
  const rng = createRng(`${seed}:monster-category:${card.id}`);
  const categories = Object.keys(expansionContent(expansion).monsters.categories);
  return generateElementalMonster({ seed, suit: card.suit, rank: card.rank, category: categories[randomInt(rng, categories.length)], expansion });
}

function contentRankFromCard(rank) {
  return ['J', 'Q', 'K'].includes(rank) ? '9' : rank;
}

function generateCardContent(kind, { seed = 1, element, rank = 'A', suit, expansion = 'core' } = {}) {
  const content = expansionContent(expansion);
  const rankNumber = normalizeRank(rank);
  const table = content[kind]?.ranks?.[String(rankNumber)];
  if (!table) throw new Error(`${kind} content is not defined for rank ${rankNumber}`);
  const resolvedElement = element || elementForSuit(suit, expansion);
  const names = table.elements[resolvedElement] || table.elements.air;
  const rng = createRng(`${seed}:${kind}:${rankNumber}:${resolvedElement}:${suit || ''}`);
  const name = names[randomInt(rng, names.length)];
  return {
    id: `${kind}-${seed}-${rankNumber}-${resolvedElement}`,
    type: kind === 'items' ? 'item' : 'trap',
    expansion,
    name,
    rank: rankNumber,
    suit: suit || null,
    element: resolvedElement,
    category: table.effectKey,
    categoryLabel: table.label,
    power: rankNumber,
    pv: cardPoints({ type: 'playing-card', rank: String(rankNumber) }),
    effect: { key: table.effectKey, severity: rankNumber }
  };
}

function generateItem(options = {}) {
  return generateCardContent('items', options);
}

function generateTrap(options = {}) {
  const trap = generateCardContent('traps', options);
  return { ...trap, resistance: trap.power, damage: Math.max(1, Math.ceil(trap.power / 4)) };
}

function cardPoints(card) {
  if (!card) return 0;
  if (card.type === 'joker') return 10;
  const rank = card.rank === 'A' ? 1 : Number(card.rank);
  if (Number.isFinite(rank)) return rank <= 3 ? rank : rank <= 6 ? 2 : rank <= 9 ? 3 : 4;
  return 0;
}

function cardColor(card) {
  if (!card || card.type !== 'playing-card') return null;
  return ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
}

const ELEMENT_ADVANTAGE = Object.freeze({ water: 'fire', fire: 'earth', earth: 'air', air: 'water' });

function elementalModifier(attacker, defender) {
  if (!attacker || !defender || attacker === defender) return 0;
  return ELEMENT_ADVANTAGE[attacker] === defender ? 1 : ELEMENT_ADVANTAGE[defender] === attacker ? -1 : 0;
}

function createCardSet() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${rank}-${suit}`,
        type: 'playing-card',
        rank,
        suit,
        element: SUIT_ELEMENTS[suit],
        cardBack: ['J', 'Q', 'K'].includes(rank) ? 'royal' : 'standard'
      });
    }
  }
  for (const element of ELEMENTS) {
    cards.push({ id: `joker-${element}`, type: 'joker', element, cardBack: 'elemental' });
  }
  return cards;
}

function cardFromId(id) {
  const [rank, suit] = String(id).split('-');
  return { id, type: 'playing-card', rank, suit, element: SUIT_ELEMENTS[suit], cardBack: ['J', 'Q', 'K'].includes(rank) ? 'royal' : 'standard' };
}

function shuffle(cards, rng) {
  const result = cards.map((card) => ({ ...card }));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function validateCharacter(input, rules) {
  const character = input || {};
  if (!character.name || typeof character.name !== 'string') throw new Error('character.name is required');
  if (!['elf', 'warrior', 'priest', 'dwarf'].includes(character.class)) throw new Error('character.class must be elf, warrior, priest, or dwarf');
  if (!ELEMENTS.includes(character.element)) throw new Error('character.element must be air, fire, water, or earth');
  if (character.lineages && character.lineages.length > 1 && !rules.allowMixedLineage) throw new Error('mixed elemental lineage is disabled in Phase 1');
  return {
    id: `${character.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${character.element}`,
    name: character.name,
    class: character.class,
    element: character.element,
    gender: character.gender || 'unspecified',
    level: 1,
    health: rules.startingHealth,
    maxHealth: rules.startingHealth,
    lineages: character.lineages || [character.element]
  };
}

function outcomeForRoll(roll) {
  if (roll <= 2) return 'monster';
  if (roll <= 4) return 'trap';
  return 'treasure';
}

function detectionForRoll(roll) {
  if (roll === 1) return 'ambush';
  if (roll === 2) return 'detected-monster';
  if (roll === 3) return 'surprise-trap';
  if (roll === 4) return 'detected-trap';
  return 'treasure';
}

function createRun({ seed, character, rules: ruleOverrides } = {}) {
  const rules = { ...DEFAULT_RULES, ...(ruleOverrides || {}) };
  const numericSeed = Number(seed);
  if (!Number.isInteger(numericSeed)) throw new Error('seed must be an integer');
  const rng = createRng(numericSeed);
  const hero = validateCharacter(character, rules);
  const deck = shuffle(createCardSet(), rng);
  const hand = deck.splice(0, rules.initialHandSize);
  const rooms = [];
  const rows = rules.gridRows || rules.gridSize;
  const columns = rules.gridColumns || rules.gridSize;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      rooms.push({ id: `room-${row}-${column}`, row, column, cardId: deck[rooms.length].id, revealed: false, event: null });
    }
  }
  return {
    id: `run-${numericSeed}`,
    seed: numericSeed,
    status: 'active',
    rules,
    character: hero,
    hand,
    handCount: hand.length,
    handLimit: rules.handLimit,
    position: { row: 0, column: 0 },
    rooms,
    remainingDeckCount: deck.length,
    stats: { roomsEntered: 0, monstersDefeated: 0, trapsCleared: 0, treasuresCollected: 0, cardsCommitted: 0, healthLost: 0 },
    log: [{ type: 'run-created', seed: numericSeed, initialHandSize: hand.length }]
  };
}

function enterRoom(run, row = run.position.row, column = run.position.column) {
  if (!run || run.status !== 'active') throw new Error('run is not active');
  const room = run.rooms.find((candidate) => candidate.row === Number(row) && candidate.column === Number(column));
  if (!room) throw new Error('room is outside the map');
  if (room.revealed) return { ...room, repeated: true };
  const rng = createRng(`${run.seed}:${room.id}`);
  const roll = randomInt(rng, 6) + 1;
  const outcome = outcomeForRoll(roll);
  const detection = detectionForRoll(roll);
  const event = { roll, detection, type: outcome, status: 'pending' };
  if (outcome === 'monster') {
    const generated = monsterFromCard(cardFromId(room.cardId), run.seed);
    event.monster = { ...generated, id: `monster-${room.id}`, threat: generated.size };
  } else if (outcome === 'trap') {
    const sourceCard = cardFromId(room.cardId);
    event.trap = { ...generateTrap({ seed: run.seed, rank: contentRankFromCard(sourceCard.rank), suit: sourceCard.suit }), id: `trap-${room.id}`, sourceCard: { rank: sourceCard.rank, suit: sourceCard.suit } };
  } else {
    event.treasure = { id: `treasure-${room.id}`, ...run.hand.length < run.handLimit ? { card: { id: `treasure-card-${room.id}`, type: 'treasure', value: 1 + randomInt(rng, 6), cardBack: 'standard' } } : { blocked: true, reason: 'hand-limit-reached' } };
    if (event.treasure.card) run.hand.push(event.treasure.card);
    run.handCount = run.hand.length;
    event.status = event.treasure.card ? 'cleared' : 'blocked';
    if (event.treasure.card) run.stats.treasuresCollected += 1;
  }
  room.revealed = true;
  room.event = event;
  run.position = { row: room.row, column: room.column };
  run.stats.roomsEntered += 1;
  run.log.push({ type: 'room-entered', roomId: room.id, event });
  return room;
}

function runSimulation({ count = 10, seed = 1001, character, rules } = {}) {
  const total = Math.max(1, Math.min(1000, Number(count) || 10));
  const results = [];
  for (let index = 0; index < total; index += 1) {
    const run = createRun({ seed: Number(seed) + index, character: character || { name: 'Simulator', class: 'elf', element: 'air' }, rules });
    enterRoom(run, 0, 0);
    if (run.rooms[0].event.type !== 'treasure') resolveRoom(run, 0, 0);
    results.push({ seed: run.seed, status: run.status, health: run.character.health, stats: run.stats });
  }
  return {
    count: total,
    completed: results.filter((result) => result.status === 'active').length,
    failed: results.filter((result) => result.status === 'failed').length,
    averageHealth: results.reduce((sum, result) => sum + result.health, 0) / total,
    results
  };
}

function resolveRoom(run, row, column, { cardIds = [], elementRoll, valueRoll } = {}) {
  const room = run.rooms.find((candidate) => candidate.row === Number(row) && candidate.column === Number(column));
  if (!room || !room.revealed) throw new Error('room must be revealed before it can be resolved');
  if (room.event.status === 'cleared') return room;
  const committed = cardIds.map((id) => run.hand.find((card) => card.id === id)).filter(Boolean);
  if (committed.length !== cardIds.length) throw new Error('one or more committed cards are not in the hand');
  const cardPower = committed.reduce((sum, card) => sum + cardPoints(card), 0);
  const event = room.event;
  const roll = Number.isInteger(elementRoll) ? elementRoll : randomInt(createRng(`${run.seed}:${room.id}:element`), 6) + 1;
  const value = Number.isInteger(valueRoll) ? valueRoll : randomInt(createRng(`${run.seed}:${room.id}:value`), 6) + 1;
  const element = ELEMENTS[(roll - 1) % ELEMENTS.length];
  let target = event.type === 'monster' ? event.monster.threat : event.trap.resistance;
  const targetElement = event.type === 'monster' ? event.monster.element : event.trap.element;
  const advantage = elementalModifier(run.character.element, targetElement);
  const total = run.character.level + cardPower + advantage + (value >= 5 ? 1 : 0);
  const success = run.rules.barrierRequiresStrictlyHigher ? total > target : total >= target;
  for (const card of committed) run.hand.splice(run.hand.findIndex((candidate) => candidate.id === card.id), 1);
  run.handCount = run.hand.length;
  run.stats.cardsCommitted += committed.length;
  event.resolution = { committedCardIds: cardIds, cardPower, element, value, advantage, target, total, success };
  if (success) {
    event.status = 'cleared';
    if (event.type === 'monster') run.stats.monstersDefeated += 1;
    if (event.type === 'trap') run.stats.trapsCleared += 1;
    if (event.type === 'treasure') run.stats.treasuresCollected += 1;
  } else {
    run.character.health -= event.type === 'monster' ? 1 : event.trap.damage;
    run.stats.healthLost += event.type === 'monster' ? 1 : event.trap.damage;
    event.status = run.character.health > 0 ? 'failed' : 'dead';
    if (event.status === 'dead') run.status = 'failed';
  }
  run.log.push({ type: 'room-resolved', roomId: room.id, event: event.status, success, total, target });
  return room;
}

function getPrecompiledRuns() {
  return PRECOMPILED_RUNS.map((run) => ({ ...run, rules: { ...DEFAULT_RULES } }));
}

module.exports = { DEFAULT_RULES, ELEMENTS, MONSTER_CATEGORIES, MONSTER_NAMES, PRECOMPILED_RUNS, SUIT_ELEMENTS, cardColor, cardFromId, cardPoints, contentRankFromCard, createCardSet, createRun, detectionForRoll, elementalModifier, enterRoom, generateElementalMonster, generateItem, generateTrap, getPrecompiledRuns, monsterFromCard, outcomeForRoll, resolveRoom, runSimulation };
