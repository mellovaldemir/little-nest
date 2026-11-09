// Local test server (no Vercel CLI needed): node dev-server.js  -> http://localhost:3000
// Serves the static files and runs /api/*.js exactly like Vercel serverless functions.
// Data is saved in data/db.local.json (delete that file to reset to data/seed.json).
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".ttf": "font/ttf", ".ico": "image/x-icon" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let p = decodeURIComponent(url.pathname);
  if (p.startsWith("/api/") && !p.includes("/_lib")) {
    const file = path.join(ROOT, "api", p.slice(5).replace(/\.js$/, "") + ".js");
    if (!file.startsWith(path.join(ROOT, "api")) || !fs.existsSync(file)) { res.writeHead(404); return res.end("Not found"); }
    let raw = "";
    for await (const c of req) raw += c;
    req.query = Object.fromEntries(url.searchParams);
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return res; };
    res.send = (b) => { res.end(b); return res; };
    try { delete require.cache[require.resolve(file)]; await require(file)(req, res); }
    catch (e) { console.error(e); if (!res.headersSent) { res.statusCode = 500; res.end(String(e)); } }
    return;
  }
  if (p.endsWith("/")) p += "index.html";
  let f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || p.includes("/_lib") || p.includes("db.local")) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": "text/html" }); return res.end(fs.readFileSync(path.join(ROOT, "404.html"))); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`ARROW dev server: http://localhost:${PORT}  (admin: /admin)  storage: ${require("./api/_lib/storage").mode}`));
