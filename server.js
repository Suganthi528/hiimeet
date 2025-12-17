// Root wrapper so platforms that run `node server.js` from project root will start the backend
// Delegates to backend/Server.js which contains the real Express + Socket.IO server.
try {
  require('./backend/server.js');
} catch (err) {
  console.error('Failed to load backend/Server.js from root server.js:', err);
  process.exit(1);
}
