// GET  /api/products            -> active products (public). Admin gets all (incl. hidden) with ?all=1
// GET  /api/products?id=x       -> one product
// POST /api/products            -> create (admin)
// PUT  /api/products?id=x       -> update (admin)
// DELETE /api/products?id=x     -> delete (admin)
const store = require("./_lib/storage");
const { requireAdmin, isAdmin } = require("./_lib/auth");
const { body, fail } = require("./_lib/util");

const CATS = ["on-the-go", "nursery", "bath", "safety"];
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function clean(input, old = {}) {
  const num = (v, d) => (v === "" || v == null || isNaN(Number(v)) ? d : Math.round(Number(v) * 100) / 100);
  const p = { ...old };
  const str = (k, max = 300) => { if (input[k] !== undefined) p[k] = String(input[k]).slice(0, max); };
  str("name", 120); str("description", 4000); str("cjLink", 500); str("cjSku", 120);
  if (input.category !== undefined) p.category = CATS.includes(input.category) ? input.category : "nursery";
  if (input.price !== undefined) p.price = num(input.price, 0);
  if (input.compareAt !== undefined) p.compareAt = num(input.compareAt, null);
  if (input.cost !== undefined) p.cost = num(input.cost, 0);
  if (input.benefits !== undefined) p.benefits = (Array.isArray(input.benefits) ? input.benefits : String(input.benefits).split("\n")).map((s) => String(s).trim()).filter(Boolean).slice(0, 10);
  if (input.images !== undefined) p.images = (Array.isArray(input.images) ? input.images : []).map(String).filter(Boolean).slice(0, 8);
  for (const k of ["active", "bestseller", "isNew", "example"]) if (input[k] !== undefined) p[k] = Boolean(input[k]);
  if (input.sort !== undefined) p.sort = num(input.sort, 0);
  return p;
}

module.exports = async (req, res) => {
  try {
    const q = req.query || {};
    let products = (await store.get("products")) || [];
    if (req.method === "GET") {
      const admin = isAdmin(req);
      res.setHeader("Cache-Control", "no-store");
      if (q.id) {
        const p = products.find((x) => x.id === q.id && (x.active || admin));
        if (!p) return res.status(404).json({ error: "Not found" });
        if (admin) return res.status(200).json(p);
        const { cost, cjLink, cjSku, ...pub } = p;
        return res.status(200).json(pub);
      }
      if (!(admin && q.all)) products = products.filter((p) => p.active);
      if (!admin) products = products.map(({ cost, cjLink, cjSku, ...pub }) => pub); // hide internal fields
      return res.status(200).json(products);
    }
    if (!requireAdmin(req, res)) return;
    const b = body(req);
    if (req.method === "POST") {
      if (!b.name) return res.status(400).json({ error: "Name is required" });
      let id = slug(b.id || b.name) || "product";
      while (products.some((p) => p.id === id)) id += "-2";
      const p = clean({ active: true, images: [], benefits: [], compareAt: null, cost: 0, category: "nursery", ...b }, { id, createdAt: new Date().toISOString() });
      products.push(p);
      await store.set("products", products);
      return res.status(201).json(p);
    }
    const i = products.findIndex((p) => p.id === q.id);
    if (i < 0) return res.status(404).json({ error: "Not found" });
    if (req.method === "PUT") {
      products[i] = clean(b, products[i]);
      products[i].updatedAt = new Date().toISOString();
      await store.set("products", products);
      return res.status(200).json(products[i]);
    }
    if (req.method === "DELETE") {
      products.splice(i, 1);
      await store.set("products", products);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (e) { fail(res, e); }
};
