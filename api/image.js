// POST /api/image {dataUrl}  (admin) -> stores an uploaded image, returns {url}
// GET  /api/image?id=x       (public) -> serves the image
const crypto = require("crypto");
const store = require("./_lib/storage");
const { requireAdmin } = require("./_lib/auth");
const { body, fail } = require("./_lib/util");

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const id = String((req.query || {}).id || "").replace(/[^a-z0-9]/gi, "");
      const d = id && (await store.getImage(id));
      const m = d && /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(d);
      if (!m) return res.status(404).json({ error: "Not found" });
      res.setHeader("Content-Type", m[1]);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.status(200).send(Buffer.from(m[2], "base64"));
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (!requireAdmin(req, res)) return;
    const d = String(body(req).dataUrl || "");
    if (!/^data:image\/(jpeg|png|webp|gif);base64,/.test(d)) return res.status(400).json({ error: "Send a JPG/PNG/WEBP image" });
    if (d.length > 1_000_000) return res.status(413).json({ error: "Image too large (max ~700 KB after resize)" });
    const id = crypto.randomBytes(8).toString("hex");
    await store.putImage(id, d);
    res.status(201).json({ url: "/api/image?id=" + id });
  } catch (e) { fail(res, e); }
};
