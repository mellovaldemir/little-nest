// Vercel serverless function: POST /api/create-cj-order
// STUB — does NOT call CJ Dropshipping yet. Returns a mock response.
//
// Later (CJ API v2):
//  1. Get an access token: POST https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken
//     body { apiKey: process.env.CJ_API_KEY }  -> data.accessToken (cache it; it lasts days)
//  2. Create order: POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2
//     headers { "CJ-Access-Token": accessToken, "Content-Type": "application/json" }
//     body { orderNumber, shippingCountryCode:"US", shippingProvince, shippingCity, shippingZip,
//            shippingAddress, shippingCustomerName, shippingPhone, email, logisticName,
//            fromCountryCode:"US", products:[{ vid: "<CJ variant id>", quantity }] }
//  3. IMPORTANT before going live: verify the PayPal order server-side (PayPal Orders API with
//     your secret) before creating the CJ order, and map our product ids to CJ variant ids (vid).
//  Check current endpoint names/fields at https://developers.cjdropshipping.com before implementing.

const SKU_TO_CJ_VID = {
  "diaper-caddy": "TODO_CJ_VID",
  "stroller-organizer": "TODO_CJ_VID",
  "stroller-fan": "TODO_CJ_VID",
  "baby-proofing-kit": "TODO_CJ_VID",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.CJ_API_KEY; // set in Vercel → Project → Settings → Environment Variables
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  // --- Real CJ createOrder call will go HERE (see notes above). Not executed now. ---

  return res.status(200).json({
    mock: true,
    cjApiKeyConfigured: Boolean(apiKey),
    message: "Mock CJ order created (no real API call).",
    cjOrderId: "MOCK-" + Date.now(),
    paypalOrderId: body.paypalOrderId || null,
    items: (body.items || []).map(i => ({ ...i, cjVid: SKU_TO_CJ_VID[i.id] || null })),
  });
};
