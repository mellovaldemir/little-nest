// POST  /api/orders                 (public) record an order after PayPal payment is captured.
// GET   /api/orders                 (admin)  list orders (newest first)
// GET   /api/orders?summary=1       (admin)  dashboard numbers
// PATCH /api/orders?id=x            (admin)  {status} or {note}
// DELETE /api/orders?id=x           (admin)
//
// NOTE: prices/totals are recalculated on the server from the product list.
// TODO before going live: verify the PayPal order on the server (PayPal Orders API with
// PAYPAL_CLIENT_ID + PAYPAL_SECRET) so nobody can POST a fake "paid" order.
const store = require("./_lib/storage");
const { requireAdmin } = require("./_lib/auth");
const { body, fail, priceCart, round2 } = require("./_lib/util");

const STATUSES = ["new", "sent_to_cj", "shipped", "delivered", "cancelled"];

module.exports = async (req, res) => {
  try {
    const q = req.query || {};
    if (req.method === "POST") {
      const b = body(req);
      if (!b.paypalOrderId) return res.status(400).json({ error: "paypalOrderId required" });
      const products = (await store.get("products")) || [];
      const coupons = (await store.get("coupons")) || [];
      const coupon = b.coupon ? coupons.find((c) => c.code === String(b.coupon).toUpperCase()) : null;
      const priced = priceCart(b.items, products, coupon);
      if (!priced.lines.length) return res.status(400).json({ error: "No valid items" });
      const ship = b.shipping || {};
      const payer = b.payer || {};
      const id = "AR-" + Date.now().toString(36).toUpperCase();
      const order = {
        id, createdAt: new Date().toISOString(), status: "new", paypalOrderId: String(b.paypalOrderId).slice(0, 60),
        paidAmount: b.paidAmount != null ? Number(b.paidAmount) : null,
        customer: {
          name: ship.name?.full_name || [payer.name?.given_name, payer.name?.surname].filter(Boolean).join(" ") || "",
          email: payer.email_address || "",
        },
        address: ship.address || null,
        items: priced.lines, subtotal: priced.subtotal, discount: priced.discount, coupon: priced.couponCode,
        shipping: priced.shipping, total: priced.total, history: [{ at: new Date().toISOString(), status: "new" }],
      };
      await store.hset("orders", id, order);
      return res.status(201).json({ ok: true, id });
    }
    if (!requireAdmin(req, res)) return;
    if (req.method === "GET") {
      const orders = (await store.hall("orders")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (q.id) { const o = orders.find((x) => x.id === q.id); return o ? res.status(200).json(o) : res.status(404).json({ error: "Not found" }); }
      if (q.summary) {
        const now = new Date();
        const ym = now.toISOString().slice(0, 7);
        const paid = orders.filter((o) => o.status !== "cancelled");
        const month = paid.filter((o) => o.createdAt.slice(0, 7) === ym);
        const sum = (arr, f) => round2(arr.reduce((s, o) => s + f(o), 0));
        const cost = (o) => o.items.reduce((s, l) => s + (l.cost || 0) * l.qty, 0);
        const inbox = await store.hall("inbox");
        return res.status(200).json({
          month: ym,
          ordersThisMonth: month.length,
          revenueThisMonth: sum(month, (o) => o.total),
          profitThisMonth: sum(month, (o) => o.total - o.shipping - cost(o)),
          revenueAllTime: sum(paid, (o) => o.total),
          profitAllTime: sum(paid, (o) => o.total - o.shipping - cost(o)),
          ordersAllTime: paid.length,
          byStatus: Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])),
          recent: orders.slice(0, 5),
          subscribers: inbox.filter((m) => m.type === "newsletter").length,
          messages: inbox.filter((m) => m.type === "message").sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5),
        });
      }
      return res.status(200).json(orders);
    }
    const o = await store.hget("orders", q.id);
    if (!o) return res.status(404).json({ error: "Not found" });
    if (req.method === "PATCH") {
      const b = body(req);
      if (b.status) {
        if (!STATUSES.includes(b.status)) return res.status(400).json({ error: "Bad status" });
        o.status = b.status; (o.history ||= []).push({ at: new Date().toISOString(), status: b.status });
      }
      if (b.tracking !== undefined) o.tracking = String(b.tracking).slice(0, 120);
      await store.hset("orders", o.id, o);
      return res.status(200).json(o);
    }
    if (req.method === "DELETE") { await store.hdel("orders", o.id); return res.status(200).json({ ok: true }); }
    res.status(405).json({ error: "Method not allowed" });
  } catch (e) { fail(res, e); }
};
