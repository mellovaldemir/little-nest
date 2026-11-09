// POST /api/contact {type:"newsletter", email} or {type:"message", name, email, orderNumber, message}
// Saved in storage (hash "inbox"); the newest messages show on the admin dashboard.
// No email is sent from here.
const crypto = require("crypto");
const store = require("./_lib/storage");
const { body, fail } = require("./_lib/util");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const b = body(req);
    const email = String(b.email || "").trim().slice(0, 120);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email" });
    const type = b.type === "message" ? "message" : "newsletter";
    const id = type === "newsletter" ? "nl:" + email.toLowerCase() : "msg:" + crypto.randomBytes(6).toString("hex");
    const rec = { id, type, email, at: new Date().toISOString() };
    if (type === "message") {
      rec.name = String(b.name || "").slice(0, 80);
      rec.orderNumber = String(b.orderNumber || "").slice(0, 40);
      rec.message = String(b.message || "").slice(0, 2000);
      if (!rec.message) return res.status(400).json({ error: "Message is empty" });
    }
    await store.hset("inbox", id, rec);
    res.status(200).json({ ok: true });
  } catch (e) { fail(res, e); }
};
