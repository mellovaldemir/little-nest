/* ARROW admin panel — single-page app. All data goes through /api/* (password-protected). */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Number(n || 0).toFixed(2);
const img = (u) => (!u ? "" : /^(https?:|data:|\/)/.test(u) ? u : "/" + u);
const fmtDate = (d) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const CATS = { "on-the-go": "On the go", nursery: "Nursery", bath: "Bath time", safety: "Baby safety" };
const STATUS = { new: "New", sent_to_cj: "Sent to CJ", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const MASCOT = "/img/brand/mascot.png";
const I = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  prod: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
  ord: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>',
  ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 16 6-5 5 4 3-2 6 4"/><circle cx="16" cy="9" r="1.5"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9V5h18v4a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6z"/><path d="M14 5v14" stroke-dasharray="2 2"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9 5 3h14l2 6M3 9h18v12H3zM9 21v-6h6v6"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
};

/* ---------------- helpers ---------------- */
async function api(method, path, body) {
  const r = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && !path.includes("action=login")) { renderLogin(); throw new Error("Please log in"); }
  if (!r.ok) throw new Error(j.error || "Request failed (" + r.status + ")");
  return j;
}
function toast(m, bad) { const t = $("#toast"); t.textContent = m; t.className = "toast show" + (bad ? " bad" : ""); clearTimeout(t._h); t._h = setTimeout(() => (t.className = "toast"), 2600); }
function modal(html) { $("#modal").innerHTML = `<div class="overlay">${html}</div>`; return $("#modal .dialog"); }
const closeModal = () => ($("#modal").innerHTML = "");
function confirmBox(title, text, okLabel = "Confirm", danger) {
  return new Promise((res) => {
    const d = modal(`<div class="dialog"><h2>${title}</h2><div>${text}</div><div class="acts"><button class="btn sec" data-x>Cancel</button><button class="btn ${danger ? "danger" : ""}" data-ok>${okLabel}</button></div></div>`);
    d.querySelector("[data-x]").onclick = () => { closeModal(); res(false); };
    d.querySelector("[data-ok]").onclick = () => { closeModal(); res(true); };
  });
}
// Resize an image file in the browser (max 1200px) so it stays small in storage.
function resizeImage(file, max = 1200) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(im, 0, 0, c.width, c.height);
        let q = 0.85, d = c.toDataURL("image/jpeg", q);
        while (d.length > 900_000 && q > 0.4) { q -= 0.1; d = c.toDataURL("image/jpeg", q); }
        res(d);
      };
      im.onerror = rej; im.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
async function uploadFile(file) { const dataUrl = await resizeImage(file); return (await api("POST", "/api/image", { dataUrl })).url; }

/* ---------------- shell ---------------- */
let STORAGE = "file";
function shell(active, title, actions = "") {
  const nav = [["dashboard", "Dashboard", I.dash], ["products", "Products", I.prod], ["orders", "Orders", I.ord], ["banners", "Banners", I.ban], ["coupons", "Coupons", I.cup]];
  $("#app").innerHTML = `<div class="layout"><aside class="sidebar"><div class="in">
    <div class="brand"><img src="${MASCOT}" alt=""><div><b>ARROW</b><small>Admin panel</small></div></div>
    ${nav.map(([k, l, ic]) => `<a href="#${k}" class="${active === k ? "on" : ""}">${ic}${l}</a>`).join("")}
    <div class="bottom"><a href="/" target="_blank">${I.store}View store</a><a href="#" id="logout">${I.out}Log out</a></div></div></aside>
    <main><div class="top"><h1>${title}</h1><div class="row">${actions}</div></div>
    ${STORAGE === "file" ? '<div class="banner info">Local test mode — data is saved in <code>data/db.local.json</code> on this computer.</div>' : ""}
    ${STORAGE === "readonly" ? '<div class="banner warn">Storage is not configured on Vercel, so changes cannot be saved. Add the KV_REST_API_URL and KV_REST_API_TOKEN environment variables (see README).</div>' : ""}
    <div id="view"></div></main></div>`;
  $("#logout").onclick = async (e) => { e.preventDefault(); await api("POST", "/api/auth?action=logout"); renderLogin(); };
  return $("#view");
}

/* ---------------- login ---------------- */
function renderLogin(msg = "") {
  $("#app").innerHTML = `<div class="login"><form class="box" id="lf"><img src="${MASCOT}" alt=""><h1>ARROW Admin</h1><p>Sign in to manage your store</p>
    <input type="password" id="pw" placeholder="Admin password" autocomplete="current-password" required autofocus>
    <button class="btn">Sign in</button><div class="err" id="lerr">${esc(msg)}</div></form></div>`;
  $("#lf").onsubmit = async (e) => {
    e.preventDefault(); $("#lerr").textContent = "";
    try { await api("POST", "/api/auth?action=login", { password: $("#pw").value }); route(); }
    catch (err) { $("#lerr").textContent = err.message; }
  };
}

/* ---------------- dashboard ---------------- */
async function viewDashboard() {
  const v = shell("dashboard", "Dashboard");
  const s = await api("GET", "/api/orders?summary=1");
  const month = new Date(s.month + "-01T12:00:00").toLocaleString("en-US", { month: "long", year: "numeric" });
  v.innerHTML = `<div class="stats">
    <div class="stat hl"><small>Sales · ${month}</small><b>${s.ordersThisMonth}</b><span>orders this month</span></div>
    <div class="stat"><small>Revenue · this month</small><b>${money(s.revenueThisMonth)}</b><span>paid by customers</span></div>
    <div class="stat"><small>Est. profit · this month</small><b>${money(s.profitThisMonth)}</b><span>revenue − shipping − product cost</span></div>
    <div class="stat"><small>All time</small><b>${money(s.revenueAllTime)}</b><span>${s.ordersAllTime} orders · ${money(s.profitAllTime)} est. profit</span></div></div>
  <div class="two"><div class="panel"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 style="margin:0">Recent orders</h2><a href="#orders">See all →</a></div>
    ${s.recent.length ? `<table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th class="right">Total</th><th>Status</th></tr></thead><tbody>
    ${s.recent.map((o) => `<tr style="cursor:pointer" onclick="location.hash='order/${o.id}'"><td class="nw"><b>${o.id}</b>${o.sample ? ' <span class="pill ex-pill">sample</span>' : ""}</td><td class="muted nw">${fmtDate(o.createdAt)}</td><td>${esc(o.customer?.name)}</td><td class="right"><b>${money(o.total)}</b></td><td><span class="pill s-${o.status}">${STATUS[o.status]}</span></td></tr>`).join("")}</tbody></table>` : '<div class="empty">No orders yet.</div>'}
  </div><div>
    <div class="panel"><h2>Orders by status</h2>${Object.entries(s.byStatus).map(([k, n]) => `<div class="row" style="justify-content:space-between;padding:5px 0"><span class="pill s-${k}">${STATUS[k]}</span><b>${n}</b></div>`).join("")}</div>
    <div class="panel"><h2>Newsletter &amp; messages</h2><p style="margin:0 0 8px"><b>${s.subscribers}</b> newsletter subscriber(s)</p>
      ${s.messages.length ? s.messages.map((m) => `<div style="border-top:1px solid var(--line);padding:8px 0"><b>${esc(m.name)}</b> <span class="muted">&lt;${esc(m.email)}&gt;</span><br><span class="muted" style="font-size:.85rem">${fmtDate(m.at)}${m.orderNumber ? " · order " + esc(m.orderNumber) : ""}</span><div>${esc(m.message)}</div></div>`).join("") : '<p class="muted" style="margin:0">No contact messages yet.</p>'}</div>
  </div></div>
  <p class="hint">Estimated profit = order total − shipping charged − product cost (the “cost” field of each product at the time of the order). PayPal fees and CJ shipping are not included.</p>`;
}

/* ---------------- products ---------------- */
let PRODUCTS = [];
async function viewProducts() {
  const v = shell("products", "Products", '<a class="btn" href="#product/new">+ Add product</a>');
  PRODUCTS = await api("GET", "/api/products?all=1");
  const draw = (q = "") => {
    const list = PRODUCTS.filter((p) => (p.name + p.category).toLowerCase().includes(q.toLowerCase())).sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99));
    $("#ptable").innerHTML = list.map((p) => {
      const margin = p.price - (p.cost || 0);
      return `<tr><td>${p.images?.length ? `<img class="thumb" src="${esc(img(p.images[0]))}" alt="">` : `<img class="thumb" src="${MASCOT}" style="object-fit:contain;opacity:.5" alt="">`}</td>
      <td><b>${esc(p.name)}</b>${p.example ? ' <span class="pill ex-pill">example</span>' : ""}<br><span class="muted">${CATS[p.category] || "-"}</span></td>
      <td class="right"><b>${money(p.price)}</b>${p.compareAt ? `<br><s class="muted">${money(p.compareAt)}</s>` : ""}</td>
      <td class="right nw">${money(p.cost)}<br><span class="muted">margin ${money(margin)}</span></td>
      <td class="nw">${p.cjSku ? `<span title="${esc(p.cjSku)}">✓ SKU</span>` : '<span class="muted">no SKU</span>'}</td>
      <td><label class="tg"><span class="switch"><input type="checkbox" data-toggle="${esc(p.id)}" ${p.active ? "checked" : ""}><i></i></span><span class="pill ${p.active ? "on-pill" : "off-pill"}">${p.active ? "Active" : "Hidden"}</span></label></td>
      <td class="right" style="white-space:nowrap"><a class="btn sec sm" href="#product/${encodeURIComponent(p.id)}">Edit</a> <button class="btn danger sm" data-del="${esc(p.id)}">Delete</button></td></tr>`;
    }).join("") || '<tr><td colspan="7" class="empty">No products.</td></tr>';
  };
  v.innerHTML = `<div class="panel"><div class="row" style="justify-content:space-between;margin-bottom:8px"><input class="inp" id="pq" placeholder="Search products…" style="max-width:320px"><span class="muted"><b>${PRODUCTS.length}</b> products · <b>${PRODUCTS.filter((p) => p.active).length}</b> active</span></div>
    <table><thead><tr><th></th><th>Product</th><th class="right">Price</th><th class="right">Cost</th><th>CJ</th><th>Status</th><th></th></tr></thead><tbody id="ptable"></tbody></table></div>`;
  draw();
  $("#pq").oninput = (e) => draw(e.target.value);
  v.addEventListener("change", async (e) => {
    const id = e.target.dataset.toggle; if (!id) return;
    try { const p = await api("PUT", "/api/products?id=" + encodeURIComponent(id), { active: e.target.checked }); Object.assign(PRODUCTS.find((x) => x.id === id), p); draw($("#pq").value); toast(p.active ? "Product is now visible in the store" : "Product hidden from the store"); }
    catch (err) { toast(err.message, true); e.target.checked = !e.target.checked; }
  });
  v.addEventListener("click", async (e) => {
    const id = e.target.dataset.del; if (!id) return;
    const p = PRODUCTS.find((x) => x.id === id);
    if (!(await confirmBox("Delete product?", `<p><b>${esc(p.name)}</b> will be removed from the store. This cannot be undone. Tip: use the Active/Hidden switch to hide it instead.</p>`, "Delete", true))) return;
    await api("DELETE", "/api/products?id=" + encodeURIComponent(id)); PRODUCTS = PRODUCTS.filter((x) => x.id !== id); draw($("#pq").value); toast("Product deleted");
  });
}

async function viewProductEdit(id) {
  const isNew = id === "new";
  const v = shell("products", isNew ? "Add product" : "Edit product", '<a class="btn sec" href="#products">← Back to products</a>');
  const p = isNew ? { name: "", price: "", compareAt: "", cost: "", category: "nursery", description: "", benefits: [], images: [], cjLink: "", cjSku: "", active: true, bestseller: false, isNew: true, example: false }
    : await api("GET", "/api/products?id=" + encodeURIComponent(id));
  let images = [...(p.images || [])];
  const sw = (k, label) => `<label class="tg"><span class="switch"><input type="checkbox" name="${k}" ${p[k] ? "checked" : ""}><i></i></span>${label}</label>`;
  v.innerHTML = `<form id="pf"><div class="two"><div>
    <div class="panel"><h2>Product details</h2><div class="form-grid">
      <label class="f full">Name<input name="name" value="${esc(p.name)}" required maxlength="120"></label>
      <label class="f">Category<select name="category">${Object.entries(CATS).map(([k, l]) => `<option value="${k}" ${p.category === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <label class="f">Sort order<input name="sort" type="number" value="${esc(p.sort ?? "")}" placeholder="1 = first"></label>
      <label class="f full">Description<textarea name="description" rows="5">${esc(p.description)}</textarea></label>
      <label class="f full">Highlights <span class="hint">one per line — shown as bullet points</span><textarea name="benefits" rows="4">${esc((p.benefits || []).join("\n"))}</textarea></label>
    </div></div>
    <div class="panel"><h2>Images</h2><p class="hint" style="margin-top:-8px">The first image is the main photo. Uploads are resized automatically.</p>
      <div class="imgs" id="imgs"></div>
      <div class="row" style="margin-top:12px"><input class="inp" id="imgUrl" placeholder="…or paste an image URL (https://…)" style="flex:1"><button type="button" class="btn sec" id="addUrl">Add URL</button></div>
      <input type="file" id="file" accept="image/*" multiple hidden></div>
  </div><div>
    <div class="panel"><h2>Pricing</h2><div class="form-grid">
      <label class="f">Price (USD)<input name="price" type="number" step="0.01" min="0" value="${esc(p.price)}" required></label>
      <label class="f">Compare-at price <span class="hint">shows “Sale”</span><input name="compareAt" type="number" step="0.01" min="0" value="${esc(p.compareAt ?? "")}" placeholder="optional"></label>
      <label class="f full">Product cost (CJ price) <span class="hint">used for profit — never shown to customers</span><input name="cost" type="number" step="0.01" min="0" value="${esc(p.cost ?? "")}"></label>
      <div class="margin full" id="margin"></div></div></div>
    <div class="panel"><h2>CJ Dropshipping</h2><div class="form-grid">
      <label class="f full">CJ product link<input name="cjLink" value="${esc(p.cjLink)}" placeholder="https://cjdropshipping.com/product/…"></label>
      <label class="f full">CJ SKU / variant ID (vid)<input name="cjSku" value="${esc(p.cjSku)}" placeholder="e.g. 1234567890-ABC"></label></div></div>
    <div class="panel"><h2>Visibility</h2><div class="toggles" style="flex-direction:column;gap:12px">
      ${sw("active", "Active (visible in store)")}${sw("bestseller", "Show in Bestsellers")}${sw("isNew", "Show in New arrivals")}${sw("example", "Mark as example product")}</div></div>
    <div class="row" style="justify-content:flex-end"><a class="btn sec" href="#products">Cancel</a><button class="btn" id="saveBtn">${isNew ? "Create product" : "Save changes"}</button></div>
  </div></div></form>`;
  const f = $("#pf");
  const drawImgs = () => {
    $("#imgs").innerHTML = images.map((u, i) => `<div class="imgbox">${i === 0 ? '<span class="main-tag">Main</span>' : ""}<img src="${esc(img(u))}" alt="">
      <div class="acts">${i ? `<button type="button" class="btn sec sm" data-main="${i}" title="Make main">★</button>` : ""}<button type="button" class="btn danger sm" data-rmimg="${i}">Remove</button></div></div>`).join("")
      + `<label class="upload" for="file">＋<br>Upload<br>photos</label>`;
  };
  const drawMargin = () => {
    const pr = +f.price.value || 0, c = +f.cost.value || 0;
    $("#margin").innerHTML = `Margin per sale: <b>${money(pr - c)}</b> ${pr ? `(${Math.round(((pr - c) / pr) * 100)}%)` : ""}`;
  };
  drawImgs(); drawMargin();
  f.price.oninput = f.cost.oninput = drawMargin;
  $("#imgs").onclick = (e) => {
    const r = e.target.dataset.rmimg, m = e.target.dataset.main;
    if (r !== undefined) { images.splice(+r, 1); drawImgs(); }
    if (m !== undefined) { images.unshift(images.splice(+m, 1)[0]); drawImgs(); }
  };
  $("#addUrl").onclick = () => { const u = $("#imgUrl").value.trim(); if (!/^https?:\/\/|^\//.test(u)) return toast("Enter a full image URL (https://…)", true); images.push(u); $("#imgUrl").value = ""; drawImgs(); };
  $("#file").onchange = async (e) => {
    for (const file of e.target.files) {
      try { toast("Uploading " + file.name + "…"); images.push(await uploadFile(file)); drawImgs(); toast("Image uploaded"); }
      catch (err) { toast(err.message, true); }
    }
    e.target.value = "";
  };
  f.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(f));
    for (const k of ["active", "bestseller", "isNew", "example"]) data[k] = f[k].checked;
    data.images = images; data.benefits = data.benefits.split("\n");
    $("#saveBtn").disabled = true;
    try {
      const saved = isNew ? await api("POST", "/api/products", data) : await api("PUT", "/api/products?id=" + encodeURIComponent(id), data);
      toast(isNew ? "Product created" : "Changes saved — live in the store");
      if (isNew) location.hash = "product/" + saved.id;
    } catch (err) { toast(err.message, true); }
    $("#saveBtn").disabled = false;
  };
}

/* ---------------- orders ---------------- */
async function viewOrders() {
  const v = shell("orders", "Orders");
  const orders = await api("GET", "/api/orders");
  let filter = "all";
  const draw = () => {
    const list = orders.filter((o) => filter === "all" || o.status === filter);
    $("#otable").innerHTML = list.map((o) => `<tr style="cursor:pointer" onclick="location.hash='order/${o.id}'">
      <td class="nw"><b>${o.id}</b>${o.sample ? ' <span class="pill ex-pill">sample</span>' : ""}</td><td class="muted nw">${fmtDate(o.createdAt)}</td>
      <td>${esc(o.customer?.name)}<br><span class="muted">${esc(o.customer?.email)}</span></td>
      <td>${esc([o.address?.admin_area_2, o.address?.admin_area_1].filter(Boolean).join(", "))}</td>
      <td class="nw">${o.items.reduce((s, l) => s + l.qty, 0)} item(s)</td><td class="right"><b>${money(o.total)}</b></td>
      <td><span class="pill s-${o.status}">${STATUS[o.status]}</span></td>
      <td class="right">${o.status === "new" ? `<a class="btn cj sm" href="#order/${o.id}" onclick="event.stopPropagation()">Review &amp; send to CJ</a>` : '<a class="btn sec sm">Open</a>'}</td></tr>`).join("")
      || '<tr><td colspan="8" class="empty">No orders here yet.</td></tr>';
    $$(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.f === filter));
  };
  v.innerHTML = `<div class="banner info">Orders appear here automatically when a PayPal payment is completed. Nothing is sent to CJ until you click <b>Send to CJ</b> and confirm.</div>
    <div class="tabs">${[["all", "All"], ...Object.entries(STATUS)].map(([k, l]) => `<button data-f="${k}">${l} (${k === "all" ? orders.length : orders.filter((o) => o.status === k).length})</button>`).join("")}</div>
    <div class="panel"><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Ship to</th><th>Items</th><th class="right">Total</th><th>Status</th><th></th></tr></thead><tbody id="otable"></tbody></table></div>`;
  $$(".tabs button").forEach((b) => (b.onclick = () => { filter = b.dataset.f; draw(); }));
  draw();
}

async function viewOrder(id) {
  const v = shell("orders", "Order " + id, '<a class="btn sec" href="#orders">← Back to orders</a>');
  const o = await api("GET", "/api/orders?id=" + encodeURIComponent(id));
  const a = o.address || {};
  const cost = o.items.reduce((s, l) => s + (l.cost || 0) * l.qty, 0);
  v.innerHTML = `${o.sample ? '<div class="banner warn">This is a SAMPLE order (test data) so you can see how orders look. You can delete it.</div>' : ""}
  <div class="two"><div>
    <div class="panel"><h2>Items</h2><table><thead><tr><th>Product</th><th>CJ SKU</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Cost</th><th class="right">Line total</th></tr></thead><tbody>
      ${o.items.map((l) => `<tr><td><b>${esc(l.name)}</b></td><td>${l.cjSku ? esc(l.cjSku) : '<span class="pill s-new">missing</span>'}</td><td class="right">${l.qty}</td><td class="right">${money(l.price)}</td><td class="right muted">${money(l.cost)}</td><td class="right"><b>${money(l.price * l.qty)}</b></td></tr>`).join("")}</tbody></table>
      <div style="max-width:320px;margin:14px 0 0 auto" class="kv"><dt>Subtotal</dt><dd class="right">${money(o.subtotal)}</dd>
        ${o.discount ? `<dt>Discount ${esc(o.coupon || "")}</dt><dd class="right">−${money(o.discount)}</dd>` : ""}
        <dt>Shipping</dt><dd class="right">${o.shipping ? money(o.shipping) : "FREE"}</dd><dt style="color:var(--forest-d)">Total paid</dt><dd class="right" style="font-size:1.2rem"><b>${money(o.total)}</b></dd>
        <dt>Est. profit</dt><dd class="right">${money(o.total - o.shipping - cost)}</dd></div></div>
    <div class="panel"><h2>Send to CJ Dropshipping</h2>
      ${o.status === "new" ? `<p>When you're ready, send this order to CJ so they ship it to the customer. <b>This uses your CJ balance</b>, so it only happens after you confirm.</p><button class="btn cj" id="sendCj">Send to CJ…</button>`
        : o.cj ? `<p>✓ Sent to CJ on ${fmtDate(o.cj.at)} — CJ order <b>${esc(o.cj.orderId)}</b>${o.cj.mock ? ' <span class="pill ex-pill">mock / test</span>' : ""}</p>` : `<p class="muted">Status is “${STATUS[o.status]}”.</p>`}
      <p class="hint">CJ connection is still a test stub (no real CJ order is created yet).</p></div>
  </div><div>
    <div class="panel"><h2>Status</h2><div class="row"><select class="inp" id="st" style="flex:1">${Object.entries(STATUS).map(([k, l]) => `<option value="${k}" ${o.status === k ? "selected" : ""}>${l}</option>`).join("")}</select><button class="btn" id="saveSt">Update</button></div>
      <label class="f" style="margin-top:12px">Tracking number<div class="row"><input class="inp" id="trk" value="${esc(o.tracking || "")}" style="flex:1" placeholder="optional"><button class="btn sec" id="saveTrk">Save</button></div></label>
      <h3 style="font-size:1rem;margin:16px 0 8px">History</h3><ul class="timeline">${(o.history || []).map((h) => `<li><b>${STATUS[h.status] || h.status}</b> · <span class="muted">${fmtDate(h.at)}</span>${h.note ? `<br><span class="muted">${esc(h.note)}</span>` : ""}</li>`).join("")}</ul></div>
    <div class="panel"><h2>Customer</h2><dl class="kv"><dt>Name</dt><dd>${esc(o.customer?.name)}</dd><dt>Email</dt><dd>${esc(o.customer?.email)}</dd>
      <dt>Ship to</dt><dd>${esc(a.address_line_1)}${a.address_line_2 ? "<br>" + esc(a.address_line_2) : ""}<br>${esc(a.admin_area_2)}, ${esc(a.admin_area_1)} ${esc(a.postal_code)}<br>${esc(a.country_code)}</dd>
      <dt>Date</dt><dd>${fmtDate(o.createdAt)}</dd><dt>PayPal ID</dt><dd>${esc(o.paypalOrderId)}</dd></dl></div>
    <button class="btn danger" id="delOrder">Delete order</button>
  </div></div>`;
  const send = $("#sendCj");
  if (send) send.onclick = async () => {
    const d = modal(`<div class="dialog"><h2>Send order ${o.id} to CJ?</h2>
      <p>CJ will charge your CJ account for the products and shipping, and ship them to:</p>
      <div class="sum"><b>${esc(o.customer?.name)}</b><br>${esc(a.address_line_1)}, ${esc(a.admin_area_2)}, ${esc(a.admin_area_1)} ${esc(a.postal_code)}<br><br>
      ${o.items.map((l) => `${l.qty} × ${esc(l.name)} ${l.cjSku ? "" : '<span style="color:var(--pink)">(no CJ SKU!)</span>'}`).join("<br>")}<br><br>Estimated CJ product cost: <b>${money(cost)}</b></div>
      <label class="tg"><input type="checkbox" id="iconfirm" style="width:18px;height:18px;accent-color:var(--forest)"> I checked the address and items and want to place this order with CJ.</label>
      <div class="acts"><button class="btn sec" data-x>Cancel</button><button class="btn cj" id="goCj" disabled>Yes, send to CJ</button></div></div>`);
    $("#iconfirm").onchange = (e) => ($("#goCj").disabled = !e.target.checked);
    d.querySelector("[data-x]").onclick = closeModal;
    $("#goCj").onclick = async () => {
      $("#goCj").disabled = true;
      try { const r = await api("POST", "/api/create-cj-order", { orderId: o.id, confirm: true }); closeModal(); toast(`Sent to CJ (${r.mock ? "mock" : "live"}): ${r.cjOrderId}`); viewOrder(o.id); }
      catch (err) { closeModal(); toast(err.message, true); }
    };
  };
  $("#saveSt").onclick = async () => { await api("PATCH", "/api/orders?id=" + o.id, { status: $("#st").value }); toast("Status updated"); viewOrder(o.id); };
  $("#saveTrk").onclick = async () => { await api("PATCH", "/api/orders?id=" + o.id, { tracking: $("#trk").value }); toast("Tracking saved"); };
  $("#delOrder").onclick = async () => {
    if (!(await confirmBox("Delete this order?", `<p>Order <b>${o.id}</b> will be removed from the panel. This does not refund the customer.</p>`, "Delete", true))) return;
    await api("DELETE", "/api/orders?id=" + o.id); toast("Order deleted"); location.hash = "orders";
  };
}

/* ---------------- banners ---------------- */
async function viewBanners() {
  const v = shell("banners", "Banners & announcement");
  const s = await api("GET", "/api/settings");
  let slides = (s.slides || []).map((x) => ({ ...x }));
  const draw = () => {
    $("#slides").innerHTML = slides.map((x, i) => `<div class="slide-ed" data-i="${i}">
      <div><div class="slide-prev" style="background-image:url('${esc(img(x.image))}')"><b>${esc(x.headline)}</b><span>${esc(x.subtitle)}</span>${x.buttonText ? `<i>${esc(x.buttonText)}</i>` : ""}</div>
        <div class="row" style="margin-top:8px"><label class="btn sec sm" style="cursor:pointer">Upload image<input type="file" accept="image/*" hidden data-up="${i}"></label>
        ${i ? `<button type="button" class="btn sec sm" data-mv="${i}">↑ Move up</button>` : ""}<button type="button" class="btn danger sm" data-rm="${i}">Remove</button></div></div>
      <div class="form-grid">
        <label class="f full">Image URL<input data-k="image" value="${esc(x.image)}"></label>
        <label class="f full">Headline<input data-k="headline" value="${esc(x.headline)}" maxlength="80"></label>
        <label class="f full">Subtitle<input data-k="subtitle" value="${esc(x.subtitle)}" maxlength="160"></label>
        <label class="f">Button text<input data-k="buttonText" value="${esc(x.buttonText)}" maxlength="40"></label>
        <label class="f">Button link<input data-k="buttonLink" value="${esc(x.buttonLink)}" placeholder="/shop.html"></label></div></div>`).join("") || '<div class="empty">No slides. Add one below.</div>';
  };
  v.innerHTML = `<div class="panel"><h2>Announcement bar</h2><p class="hint" style="margin-top:-8px">The thin green bar at the very top of every page.</p>
      <div class="form-grid"><label class="f full">Text<input id="ann" value="${esc(s.announcement)}" maxlength="200"></label>
      <label class="f full">Contact email shown on the site<input id="mail" value="${esc(s.contactEmail || "")}"></label></div></div>
    <div class="panel"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Homepage carousel</h2><span class="hint">Best image size: 1280 × 720 px, with empty space on the left for the text.</span></div>
      <div id="slides"></div><button type="button" class="btn sec" id="addSlide">+ Add slide</button></div>
    <div class="row" style="justify-content:flex-end"><a class="btn sec" href="/" target="_blank">Preview store</a><button class="btn" id="saveB">Save banners</button></div>`;
  draw();
  $("#slides").addEventListener("input", (e) => {
    const k = e.target.dataset.k; if (!k) return;
    const i = +e.target.closest(".slide-ed").dataset.i; slides[i][k] = e.target.value;
    const pv = e.target.closest(".slide-ed").querySelector(".slide-prev");
    pv.style.backgroundImage = `url('${img(slides[i].image)}')`;
    pv.innerHTML = `<b>${esc(slides[i].headline)}</b><span>${esc(slides[i].subtitle)}</span>${slides[i].buttonText ? `<i>${esc(slides[i].buttonText)}</i>` : ""}`;
  });
  $("#slides").addEventListener("change", async (e) => {
    const i = e.target.dataset.up; if (i === undefined || !e.target.files[0]) return;
    try { toast("Uploading…"); slides[+i].image = await uploadFile(e.target.files[0]); draw(); toast("Image uploaded — remember to Save"); } catch (err) { toast(err.message, true); }
  });
  $("#slides").addEventListener("click", (e) => {
    const rm = e.target.dataset.rm, mv = e.target.dataset.mv;
    if (rm !== undefined) { slides.splice(+rm, 1); draw(); }
    if (mv !== undefined) { const j = +mv; [slides[j - 1], slides[j]] = [slides[j], slides[j - 1]]; draw(); }
  });
  $("#addSlide").onclick = () => { slides.push({ image: "img/slides/slide1.jpg", headline: "New headline", subtitle: "", buttonText: "Shop now", buttonLink: "/shop.html" }); draw(); };
  $("#saveB").onclick = async () => {
    try { await api("PUT", "/api/settings", { announcement: $("#ann").value, contactEmail: $("#mail").value, slides }); toast("Banners saved — live in the store"); }
    catch (err) { toast(err.message, true); }
  };
}

/* ---------------- coupons ---------------- */
async function viewCoupons() {
  const v = shell("coupons", "Discount coupons");
  const list = await api("GET", "/api/coupons");
  v.innerHTML = `<div class="two"><div class="panel"><h2>Active codes</h2>
    ${list.length ? `<table><thead><tr><th>Code</th><th>Discount</th><th>Minimum order</th><th>Created</th><th></th></tr></thead><tbody>
    ${list.map((c) => `<tr><td><b style="font-family:monospace;font-size:1.05rem">${esc(c.code)}</b></td><td>${c.type === "percent" ? c.value + "% off" : money(c.value) + " off"}</td><td>${c.minSubtotal ? money(c.minSubtotal) : '<span class="muted">none</span>'}</td><td class="muted">${c.createdAt ? fmtDate(c.createdAt) : ""}</td><td class="right"><button class="btn danger sm" data-del="${esc(c.code)}">Delete</button></td></tr>`).join("")}</tbody></table>` : '<div class="empty">No coupons yet.</div>'}
    </div><div class="panel"><h2>Create a coupon</h2><form id="cf" class="form-grid">
      <label class="f full">Code<input name="code" required placeholder="e.g. SUMMER20" style="text-transform:uppercase" maxlength="30"></label>
      <label class="f">Type<select name="type"><option value="percent">Percent (%)</option><option value="fixed">Fixed amount ($)</option></select></label>
      <label class="f">Value<input name="value" type="number" step="0.01" min="0.01" required placeholder="10"></label>
      <label class="f full">Minimum order subtotal ($) <span class="hint">optional</span><input name="minSubtotal" type="number" step="0.01" min="0" placeholder="0"></label>
      <button class="btn full" style="justify-content:center">Create coupon</button></form>
      <p class="hint">Customers type the code in the cart. One code per order. The newsletter popup offers WELCOME10 — keep that code if you use it.</p></div></div>`;
  $("#cf").onsubmit = async (e) => {
    e.preventDefault();
    try { const c = await api("POST", "/api/coupons", Object.fromEntries(new FormData(e.target))); toast(`Coupon ${c.code} created`); viewCoupons(); }
    catch (err) { toast(err.message, true); }
  };
  v.onclick = async (e) => {
    const code = e.target.dataset.del; if (!code) return;
    if (!(await confirmBox("Delete coupon?", `<p>Code <b>${esc(code)}</b> will stop working immediately.</p>`, "Delete", true))) return;
    await api("DELETE", "/api/coupons?code=" + encodeURIComponent(code)); toast("Coupon deleted"); viewCoupons();
  };
}

/* ---------------- router ---------------- */
async function route() {
  try {
    const me = await api("GET", "/api/auth");
    STORAGE = me.storage;
    if (!me.admin) return renderLogin(me.configured ? "" : "ADMIN_PASSWORD is not set on the server yet (see README).");
    const [view, arg] = (location.hash.slice(1) || "dashboard").split("/");
    const views = { dashboard: viewDashboard, products: viewProducts, product: () => viewProductEdit(decodeURIComponent(arg || "new")), orders: viewOrders, order: () => viewOrder(arg), banners: viewBanners, coupons: viewCoupons };
    await (views[view] || viewDashboard)();
    window.scrollTo(0, 0);
  } catch (e) { if (e.message !== "Please log in") toast(e.message, true); console.error(e); }
}
window.addEventListener("hashchange", route);
route();
