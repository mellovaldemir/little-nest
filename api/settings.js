// GET /api/settings (public): announcement bar, carousel slides, store info.
// PUT /api/settings (admin): replace settings.
const store = require("./_lib/storage");
const { requireAdmin } = require("./_lib/auth");
const { body, fail } = require("./_lib/util");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json((await store.get("settings")) || {});
    }
    if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });
    if (!requireAdmin(req, res)) return;
    const b = body(req);
    const cur = (await store.get("settings")) || {};
    const s = String;
    const next = {
      ...cur,
      announcement: s(b.announcement ?? cur.announcement ?? "").slice(0, 200),
      contactEmail: s(b.contactEmail ?? cur.contactEmail ?? "").slice(0, 120),
      slides: (Array.isArray(b.slides) ? b.slides : cur.slides || []).slice(0, 6).map((x) => ({
        image: s(x.image || "").slice(0, 500), headline: s(x.headline || "").slice(0, 80), subtitle: s(x.subtitle || "").slice(0, 160),
        buttonText: s(x.buttonText || "").slice(0, 40), buttonLink: s(x.buttonLink || "").slice(0, 300),
      })),
    };
    await store.set("settings", next);
    res.status(200).json(next);
  } catch (e) { fail(res, e); }
};
