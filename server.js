// Root wrapper so platforms that run `node server.js` from project root will start the backend
// Tries multiple common entry points (case variants and locations) to accommodate case-sensitive hosts (Render, Linux).
const fs = require('fs');
const path = require('path');

const candidates = [
  './backend/server.js',
  './backend/Server.js',
  './backend/index.js',
  './Server.js',
  './server.js',
  './src/server.js',
  './src/Server.js',
];

let loaded = false;
for (const rel of candidates) {
  const p = path.join(__dirname, rel);
  try {
    if (fs.existsSync(p)) {
      console.log(`👉 Loading backend entry: ${rel}`);
      require(p);
      loaded = true;
      break;
    }
  } catch (err) {
    console.warn(`Attempt to load ${rel} failed:`, err && err.message ? err.message : err);
  }
}

if (!loaded) {
  console.error('❌ No backend entry found. Tried the following paths:');
  candidates.forEach((c) => console.error(' -', c));
  console.error('\nDirectory listing of project root for debugging:');
  try {
    const items = fs.readdirSync(__dirname);
    items.forEach((it) => console.error('   ', it));
  } catch (err) {
    console.error('   (failed to list directory):', err && err.message ? err.message : err);
  }
  process.exit(1);
}
