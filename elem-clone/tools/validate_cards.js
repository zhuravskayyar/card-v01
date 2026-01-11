const fs = require('fs');
const vm = require('vm');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'js', 'data', 'cards.js');
const content = fs.readFileSync(filePath, 'utf8');

const sandbox = { window: {}, console: console, module: {}, exports: {} };
vm.createContext(sandbox);

try {
  vm.runInContext(content, sandbox, { filename: filePath });
} catch (err) {
  console.error('Error executing cards.js:', err.stack || err.message);
  process.exit(2);
}

const ALL_CARDS = sandbox.window.ALL_CARDS || [];
const STARTER_CARDS = sandbox.window.STARTER_CARDS || [];
const RARITY_MULTIPLIERS = sandbox.window.RARITY_MULTIPLIERS || {};

const errors = [];

// Basic counts
const total = ALL_CARDS.length;
const starters = STARTER_CARDS.length;

// Duplicates
const ids = ALL_CARDS.map(c => c.id);
const dupIds = ids.filter((v,i,a)=>a.indexOf(v)!==i);
const uniqueDup = [...new Set(dupIds)];
if (uniqueDup.length) errors.push(`Duplicate IDs found: ${uniqueDup.slice(0,20).join(', ')}${uniqueDup.length>20?', ...':''}`);

// Expected non-starter cards: detect how many non-starter (ids not starting with 'S')
const nonStarter = ALL_CARDS.filter(c => !String(c.id).startsWith('S'));
if (nonStarter.length !== 240) {
  errors.push(`Non-starter cards count is ${nonStarter.length}, expected 240`);
}

// Check missing fields & bad types
const badCards = [];
for (const c of ALL_CARDS) {
  if (!c.id || !c.name) badCards.push({ id: c.id, reason: 'missing id or name' });
  if (typeof c.basePower !== 'number') badCards.push({ id: c.id, reason: 'basePower not number' });
  if (!c.element) badCards.push({ id: c.id, reason: 'missing element' });
  if (!c.rarity) badCards.push({ id: c.id, reason: 'missing rarity' });
  // check rarity value exists in multipliers
  if (c.rarity) {
    const allowed = Object.values(RARITY_MULTIPLIERS).map(x=>x.name);
    if (!allowed.includes(c.rarity)) badCards.push({ id: c.id, reason: `rarity '${c.rarity}' not in RARITY_MULTIPLIERS` });
  }
}
if (badCards.length) errors.push(`Cards with missing/invalid fields: ${badCards.length} (showing up to 20)`);

// Distribution by rarity
const counts = ALL_CARDS.reduce((acc,c)=>{ acc[c.rarity]=(acc[c.rarity]||0)+1; return acc; }, {});

// Elements set
const elements = [...new Set(ALL_CARDS.map(c=>c.element))];

// IDs format issues
const badIdFormat = ALL_CARDS.filter(c => {
  if (!c.id) return true;
  if (String(c.id).startsWith('S')) return false; // starter allowed
  return !/^F\d{2}-R[1-6]$/.test(c.id);
}).map(c=>c.id).slice(0,50);
if (badIdFormat.length) errors.push(`Some card IDs have unexpected format (examples): ${badIdFormat.join(', ')}`);

// Starter set checks
if (starters !== 16) errors.push(`Starter cards count is ${starters}, expected 16`);

// Output
console.log('Validation report for', filePath);
console.log('Total ALL_CARDS:', total);
console.log('Starter cards:', starters);
console.log('Non-starter cards count:', nonStarter.length);
console.log('Rarity distribution:', counts);
console.log('Elements found:', elements);
if (errors.length) {
  console.log('\nErrors / warnings:');
  errors.forEach(e => console.log(' -', e));
} else {
  console.log('\nNo issues found.');
}

// If there are bad cards, show first few
if (badCards.length) {
  console.log('\nSample bad cards (up to 20):');
  console.log(JSON.stringify(badCards.slice(0,20), null, 2));
}

process.exit(errors.length?1:0);
