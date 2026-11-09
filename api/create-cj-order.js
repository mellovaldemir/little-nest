// POST /api/create-cj-order  { orderId, confirm: true }   (ADMIN ONLY)
// Called ONLY from the admin panel "Send to CJ" button, after a human confirms the dialog.
// It is never called automatically after a payment (money needs human approval).
//
// STUB — does NOT call CJ Dropshipping yet. Returns a mock response and marks the order "sent_to_cj".
//
// Later (CJ API v2):
//  1. Get an access token: POST https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken
//     body { apiKey: process.env.CJ_API_KEY }  -> data.accessToken (cache it; it lasts days)
//  2. Create order: POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2
//     headers { "CJ-Access-Token": accessToken, "Content-Type": "application/json" }
//     body { orderNumber, shippingCountryCode:"US", shippingProvince, shippingCity, shippingZip,
//            shippingAddress, shippingCustomerName, shippingPhone, email, logisticName,
//            fromCountryCode:"US", products:[{ vid: "<CJ variant id>", quantity }] }
//     -> the CJ variant id comes from each product's "CJ SKU / variant id" field in the admin panel.
//  3. IMPORTANT before going live: verify the PayPal order server-side (PayPal Orders API with
//     your secret) before creating the CJ order.
//  Check current endpoint names/fields at https://developers.cjdropshipping.com before implementing.
const store = require("./_lib/storage");
const { requireAdmin } = require("./_lib/auth");
const { body, fail } = require("./_lib/util");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (!requireAdmin(req, res)) return;
    const b = body(req);
    if (b.confirm !== true) return res.status(400).json({ error: "Explicit confirmation required" });
    const order = await store.hget("orders", String(b.orderId || ""));
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "new") return res.status(409).json({ error: `Order is already "${order.status}"` });

    const cjPayload = {
      orderNumber: order.id,
      shippingCountryCode: order.address?.country_code || "US",
      shippingProvince: order.address?.admin_area_1 || "",
      shippingCity: order.address?.admin_area_2 || "",
      shippingZip: order.address?.postal_code || "",
      shippingAddress: [order.address?.address_line_1, order.address?.address_line_2].filter(Boolean).join(", "),
      shippingCustomerName: order.customer?.name || "",
      email: order.customer?.email || "",
      products: order.items.map((l) => ({ vid: l.cjSku || "TODO_CJ_VID", quantity: l.qty })),
    };
    const missingSku = order.items.filter((l) => !l.cjSku).map((l) => l.name);

    // --- Real CJ createOrder call will go HERE (see notes above). Not executed now. ---
    const result = { mock: true, cjApiKeyConfigured: Boolean(process.env.CJ_API_KEY), cjOrderId: "MOCK-" + Date.now(), message: "Mock CJ order created (no real API call).", missingSku, payload: cjPayload };

    order.status = "sent_to_cj";
    order.cj = { orderId: result.cjOrderId, mock: true, at: new Date().toISOString() };
    (order.history ||= []).push({ at: order.cj.at, status: "sent_to_cj", note: "Mock CJ order " + result.cjOrderId });
    await store.hset("orders", order.id, order);
    res.status(200).json({ ...result, order });
  } catch (e) { fail(res, e); }
};
