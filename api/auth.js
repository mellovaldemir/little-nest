// POST /api/auth?action=login  {password}  -> sets HttpOnly session cookie
// POST /api/auth?action=logout
// GET  /api/auth                           -> {admin:true|false, configured, storage}
const auth = require("./_lib/auth");
const store = require("./_lib/storage");
const { body } = require("./_lib/util");

module.exports = async (req, res) => {
  const action = (req.query || {}).action;
  if (req.method === "GET") return res.status(200).json({ admin: auth.isAdmin(req), configured: auth.configured(), storage: store.mode });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (action === "logout") { auth.clearSession(res); return res.status(200).json({ ok: true }); }
  if (!auth.configured()) return res.status(503).json({ error: "ADMIN_PASSWORD is not set on the server." });
  if (!auth.checkPassword(body(req).password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return res.status(401).json({ error: "Wrong password" });
  }
  auth.setSession(req, res);
  res.status(200).json({ ok: true });
};
