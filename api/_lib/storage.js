// Storage adapter.
// - On Vercel: uses Upstash Redis / Vercel KV through the REST API
//   (env KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
// - Locally (no env vars): uses a JSON file at data/db.local.json (created from api/_lib/seed.json).
// Data layout: "products" (JSON array), "settings" (JSON object), "coupons" (JSON array),
//   hash "orders" (field = order id), hash "inbox" (newsletter + contact messages), "img:<id>" (image data URL).
const fs = require("fs");
const path = require("path");

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ROOT = path.join(__dirname, "..", "..");
const LOCAL_FILE = process.env.LOCAL_DB_FILE || path.join(ROOT, "data", "db.local.json");

const mode = URL_ && TOKEN ? "kv" : process.env.VERCEL ? "readonly" : "file";

// require() (not fs) so Vercel always bundles the seed file with the functions.
const SEED = require("./seed.json");
function readSeed() {
  return JSON.parse(JSON.stringify(SEED));
}

// ---------- Redis REST ----------
async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error("KV error: " + j.error);
  return j.result;
}

let seeded = false;
async function ensureSeedKV() {
  if (seeded) return;
  // SET NX only writes if the key does not exist yet -> seeding never overwrites your data.
  const s = readSeed();
  const res = await redis(["SET", "products", JSON.stringify(s.products), "NX"]);
  if (res === "OK") {
    await redis(["SET", "settings", JSON.stringify(s.settings), "NX"]);
    await redis(["SET", "coupons", JSON.stringify(s.coupons), "NX"]);
    for (const o of s.orders || []) await redis(["HSETNX", "orders", o.id, JSON.stringify(o)]);
  }
  seeded = true;
}

// ---------- local JSON file ----------
function loadFile() {
  if (!fs.existsSync(LOCAL_FILE)) {
    const s = readSeed();
    const db = { products: s.products, settings: s.settings, coupons: s.coupons, orders: {}, inbox: {}, images: {} };
    for (const o of s.orders || []) db.orders[o.id] = o;
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(db, null, 1));
  }
  return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8"));
}
function saveFile(db) {
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(db, null, 1));
}
function readonlyDb() {
  const s = readSeed();
  const db = { products: s.products, settings: s.settings, coupons: s.coupons, orders: {}, inbox: {}, images: {} };
  for (const o of s.orders || []) db.orders[o.id] = o;
  return db;
}
function noWrite() {
  const e = new Error("Storage not configured: add KV_REST_API_URL and KV_REST_API_TOKEN in Vercel (see README).");
  e.status = 503;
  throw e;
}

// ---------- public API ----------
const JSON_KEYS = ["products", "settings", "coupons"];
const HASHES = { orders: "orders", inbox: "inbox" };

module.exports = {
  mode,
  async get(key) {
    if (mode === "kv") {
      await ensureSeedKV();
      const v = await redis(["GET", key]);
      return v == null ? null : JSON.parse(v);
    }
    const db = mode === "file" ? loadFile() : readonlyDb();
    if (JSON_KEYS.includes(key)) return db[key];
    return null;
  },
  async set(key, value) {
    if (mode === "kv") { await ensureSeedKV(); return redis(["SET", key, JSON.stringify(value)]); }
    if (mode === "readonly") noWrite();
    const db = loadFile(); db[key] = value; saveFile(db);
  },
  async hset(hash, field, value) {
    if (mode === "kv") { await ensureSeedKV(); return redis(["HSET", HASHES[hash], field, JSON.stringify(value)]); }
    if (mode === "readonly") noWrite();
    const db = loadFile(); (db[hash] ||= {})[field] = value; saveFile(db);
  },
  async hget(hash, field) {
    if (mode === "kv") { await ensureSeedKV(); const v = await redis(["HGET", HASHES[hash], field]); return v ? JSON.parse(v) : null; }
    const db = mode === "file" ? loadFile() : readonlyDb();
    return (db[hash] || {})[field] || null;
  },
  async hdel(hash, field) {
    if (mode === "kv") return redis(["HDEL", HASHES[hash], field]);
    if (mode === "readonly") noWrite();
    const db = loadFile(); delete (db[hash] || {})[field]; saveFile(db);
  },
  async hall(hash) {
    if (mode === "kv") {
      await ensureSeedKV();
      const arr = (await redis(["HGETALL", HASHES[hash]])) || [];
      const out = [];
      for (let i = 0; i < arr.length; i += 2) out.push(JSON.parse(arr[i + 1]));
      return out;
    }
    const db = mode === "file" ? loadFile() : readonlyDb();
    return Object.values(db[hash] || {});
  },
  async putImage(id, dataUrl) {
    if (mode === "kv") return redis(["SET", "img:" + id, dataUrl]);
    if (mode === "readonly") noWrite();
    const db = loadFile(); (db.images ||= {})[id] = dataUrl; saveFile(db);
  },
  async getImage(id) {
    if (mode === "kv") return redis(["GET", "img:" + id]);
    if (mode === "readonly") return null;
    return (loadFile().images || {})[id] || null;
  },
};
