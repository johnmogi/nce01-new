const fs = require('node:fs');
const path = require('node:path');

const CONTENT_ROOT = path.join(__dirname, '..', 'data', 'expansions');
const BUILTIN_CORE = {
  id: require('../data/expansions/core/manifest.json').id,
  name: require('../data/expansions/core/manifest.json').name,
  version: require('../data/expansions/core/manifest.json').version,
  content: {
    cards: require('../data/expansions/core/cards.json'),
    monsters: require('../data/expansions/core/monsters.json'),
    items: require('../data/expansions/core/items.json'),
    traps: require('../data/expansions/core/traps.json')
  }
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadExpansion(expansionPath) {
  const manifest = readJson(path.join(expansionPath, 'manifest.json'));
  const content = {};
  for (const type of manifest.content || []) {
    content[type] = readJson(path.join(expansionPath, `${type}.json`));
  }
  return { ...manifest, content };
}

function loadContentRegistry(root = CONTENT_ROOT) {
  let expansions = [];
  try {
    expansions = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => loadExpansion(path.join(root, entry.name)));
  } catch (_) {
    expansions = [];
  }
  if (!expansions.some((expansion) => expansion.id === BUILTIN_CORE.id)) expansions.unshift(BUILTIN_CORE);
  if (!expansions.length) throw new Error(`No content expansions found at ${root}`);
  return expansions.reduce((registry, expansion) => {
    registry[expansion.id] = expansion;
    return registry;
  }, {});
}

const CONTENT = loadContentRegistry();
const CORE_CONTENT = CONTENT.core.content;

function expansionContent(expansion = 'core') {
  const selected = CONTENT[expansion];
  if (!selected) throw new Error(`content expansion not found: ${expansion}`);
  return selected.content;
}

function normalizeRank(rank) {
  if (rank === 'A' || rank === 1 || rank === '1') return 1;
  const numeric = Number(rank);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 9) throw new Error('generator rank must be between 1 and 9');
  return numeric;
}

function elementForSuit(suit, expansion = 'core') {
  const element = expansionContent(expansion).cards?.suitElements?.[suit];
  if (!element) throw new Error(`unknown card suit: ${suit}`);
  return element;
}

module.exports = { CONTENT, CORE_CONTENT, elementForSuit, expansionContent, loadContentRegistry, normalizeRank };
