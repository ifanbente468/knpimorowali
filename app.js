// Entry point for cPanel / CloudLinux Passenger (Setup Node.js App).
// Pakai bundle standalone hasil GitHub Actions bila tersedia,
// jika tidak fallback ke build lokal (node server.js).
const fs = require("node:fs");
const path = require("node:path");

const standalone = path.join(__dirname, ".next", "standalone", "server.js");

if (fs.existsSync(standalone)) {
  require(standalone);
} else {
  require("./server.js");
}
