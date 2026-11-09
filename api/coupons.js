// GET    /api/coupons?code=XXX  (public) -> validate a code: {code,type,value,minSubtotal}
// GET    /api/coupons           (admin)  -> list
// POST   /api/coupons           (admin)  -> create {code,type:"percent"|"fixed",value,minSubtotal}
// DELETE /api/coupons?code=XXX  (admin)
const store = require("./_lib/storage");
const { requireAdmin } = require("./_lib/auth");
const { body, fail } = require("./_lib/util");

module.exports = async (req, res) => {
  try {
    const q = req.query || {};
    const coupons = (await store.get("coupons")) || [];
    if (req.method === "GET" && q.code) {
      const c = coupons.find((x) => x.code === String(q.code).trim().toUpperCase() && x.active !== false);
      if (!c) return res.status(404).json({ error: "Invalid or expired code" });
      return res.status(200).json({ code: c.code, type: c.type, value: c.value, minSubtotal: c.minSubtotal || 0 });
    }
    if (!requireAdmin(req, res)) return;
    if (req.method === "GET") return res.status(200).json(coupons);
    if (req.method === "POST") {
      const b = body(req);
      const code = String(b.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30);
      const value = Number(b.value);
      if (!code) return res.status(400).json({ error: "Code is required" });
      if (!["percent", "fixed"].includes(b.type)) return res.status(400).json({ error: "Type must be percent or fixed" });
      if (!(value > 0) || (b.type === "percent" && value > 100)) return res.status(400).json({ error: "Invalid value" });
      if (coupons.some((c) => c.code === code)) return res.status(409).json({ error: "Code already exists" });
      const c = { code, type: b.type, value, minSubtotal: Number(b.minSubtotal) || 0, active: true, createdAt: new Date().toISOString() };
      coupons.push(c);
      await store.set("coupons", coupons);
      return res.status(201).json(c);
    }
    if (req.method === "DELETE") {
      await store.set("coupons", coupons.filter((c) => c.code !== String(q.code || "").toUpperCase()));
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (e) { fail(res, e); }
};
