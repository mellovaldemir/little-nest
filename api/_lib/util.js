function body(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === "string") { try { return JSON.parse(b); } catch { return {}; } }
  return b;
}
function fail(res, e) {
  console.error(e);
  res.status(e.status || 500).json({ error: e.message || "Server error" });
}
const round2 = (n) => Math.round(n * 100) / 100;
const FREE_SHIP = 35, SHIP_FEE = 4.99;

// Server-side price calculation (never trust prices sent by the browser).
function priceCart(items, products, coupon) {
  const lines = [];
  for (const it of items || []) {
    const p = products.find((x) => x.id === it.id);
    const qty = Math.max(1, Math.min(99, parseInt(it.qty) || 1));
    if (!p) continue;
    lines.push({ id: p.id, name: p.name, price: p.price, cost: Number(p.cost) || 0, qty, cjSku: p.cjSku || "", cjLink: p.cjLink || "" });
  }
  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.qty, 0));
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP ? 0 : SHIP_FEE;
  let discount = 0, couponCode = null;
  if (coupon && coupon.active !== false && subtotal >= (Number(coupon.minSubtotal) || 0)) {
    discount = coupon.type === "percent" ? round2((subtotal * coupon.value) / 100) : Math.min(subtotal, Number(coupon.value));
    couponCode = coupon.code;
  }
  return { lines, subtotal, shipping, discount, couponCode, total: round2(subtotal - discount + shipping) };
}
module.exports = { body, fail, round2, priceCart, FREE_SHIP, SHIP_FEE };
