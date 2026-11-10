/* ARROW storefront — shared code (header/footer, data loading, cart, product cards). */
const FREE_SHIP = 35, SHIP_FEE = 4.99, CART_KEY = "arrow_cart", COUPON_KEY = "arrow_coupon";
const BRAND = "ARROW";
const CATEGORIES = {
  "learn-play": "Learn & Play",
  "room-bedtime": "Room & Bedtime",
  "on-the-go": "On the Go",
  "fidgets-teens": "Fidgets & Teens",
  cleaning: "Cleaning",
  kitchen: "Kitchen",
  "desk-cable": "Desk & Cable",
  "feeding-play": "Feeding & Play",
  "grooming-cleanup": "Grooming & Cleanup",
  "car-organize": "Organize",
  "car-clean": "Clean",
  "car-mounts": "Mounts",
  "setup-stands": "Setup & Stands",
  "wall-decor": "Wall & Room Decor",
  "desk-fun": "Desk Fun",
};
const TABS = {
  kids: { label: "Kids", cats: ["learn-play", "room-bedtime", "on-the-go", "fidgets-teens"] },
  home: { label: "Home", cats: ["cleaning", "kitchen", "desk-cable"] },
  pets: { label: "Pets", cats: ["feeding-play", "grooming-cleanup"] },
  car: { label: "Car", cats: ["car-organize", "car-clean", "car-mounts"] },
  geek: { label: "Geek & Gamer", cats: ["setup-stands", "wall-decor", "desk-fun"] },
};
const TAB_OF = Object.fromEntries(Object.entries(TABS).flatMap(([tab, x]) => x.cats.map((c) => [c, tab])));
const tabOf = (p) => p.tab || TAB_OF[p.category] || "kids";
const catLabel = (c) => CATEGORIES[c] || c;
const storeTabsHTML = (active, hrefFor) => `<div class="store-tabs" role="tablist" aria-label="Shop section">
  ${Object.entries(TABS).map(([k, x]) => {
    const href = hrefFor ? hrefFor(k) : `/shop.html?tab=${k}`;
    return `<a role="tab" aria-selected="${active === k}" class="${active === k ? "on" : ""}" href="${esc(href)}">${esc(x.label)}</a>`;
  }).join("")}
</div>`;
function groupedSectionsHTML(list, tab, opts = {}) {
  const cats = (TABS[tab] || TABS.kids).cats;
  const chunks = cats.map((c) => ({ c, items: list.filter((p) => p.category === c) })).filter((x) => x.items.length);
  if (!chunks.length) return "";
  const limit = opts.limit || 0;
  return chunks.map(({ c, items }) => {
    const shown = limit ? items.slice(0, limit) : items;
    return `<section class="cat-sec" id="sec-${esc(c)}">
    <div class="sec-head"><h2>${esc(catLabel(c))}</h2><a href="/shop.html?tab=${esc(tab)}&cat=${esc(c)}">View all →</a></div>
    <div class="grid">${shown.map((p) => productCard(p)).join("")}</div>
  </section>`;
  }).join("");
}
const money = (n) => "$" + Number(n || 0).toFixed(2);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const img = (u) => (!u ? "" : /^(https?:|data:|\/)/.test(u) ? u : "/" + u);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 8H6"/></svg>',
  left: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h13v11H1zM14 9h4l4 4v3h-8"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  ret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  stroller: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 10h6l6 22h26a20 20 0 0 0-20-20v20"/><path d="M26 32c0 8 6 12 13 12s13-4 13-12"/><circle cx="24" cy="52" r="5"/><circle cx="50" cy="52" r="5"/></svg>',
  crib: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M8 12v44M56 12v44M8 22h48M8 46h48M18 22v24M28 22v24M36 22v24M46 22v24"/></svg>',
  duck: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 28a10 10 0 1 1 18-6c0 3-1 5-3 7 8-1 15 1 17 6 3 9-6 17-20 17S10 46 12 36c1-4 5-7 10-8z"/><path d="M40 20h7l-4 4"/><circle cx="31" cy="18" r="1.5" fill="currentColor"/></svg>',
  safety: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M32 6 10 14v16c0 14 9 23 22 28 13-5 22-14 22-28V14z"/><path d="m22 32 7 7 13-14" stroke-linecap="round"/></svg>',
};
const ARROW_SVG = '<svg viewBox="0 0 100 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6c30-4 60 3 90-1"/><path d="m86 1 7 4-7 5M3 6l5-4M3 6l5 4"/></svg>';
const MASCOT = "/img/brand/mascot.png";

/* ---------------- data ---------------- */
async function getJSON(primary, fallback) {
  try { const r = await fetch(primary, { cache: "no-store" }); if (r.ok) return await r.json(); throw new Error(r.status); }
  catch (e) { if (!fallback) throw e; const r = await fetch(fallback); return r.json(); }
}
let _products;
async function loadProducts() {
  if (!_products) _products = getJSON("/api/products", "/data/products.json").then((list) =>
    list.filter((p) => p.active !== false).sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99)));
  return _products;
}
let _settings;
const loadSettings = () => (_settings ||= getJSON("/api/settings", "/data/settings.json").catch(() => ({})));

/* ---------------- cart ---------------- */
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } };
const saveCart = (c) => { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCount(); };
function addToCart(id, qty = 1, name) {
  const c = getCart(); const i = c.find((x) => x.id === id);
  i ? (i.qty += qty) : c.push({ id, qty }); saveCart(c);
  toast(`${name || "Item"} added to cart`);
}
function setQty(id, qty) { saveCart(getCart().map((x) => (x.id === id ? { ...x, qty } : x)).filter((x) => x.qty > 0)); }
function updateCount() { const n = getCart().reduce((s, x) => s + x.qty, 0); $$(".cart-count").forEach((e) => (e.textContent = n)); }
function toast(m) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.append(t); }
  t.textContent = m; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2000);
}
function cartTotals(products, coupon) {
  const lines = getCart().map((x) => ({ ...x, p: products.find((p) => p.id === x.id) })).filter((x) => x.p);
  const sub = +lines.reduce((s, l) => s + l.p.price * l.qty, 0).toFixed(2);
  const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_FEE;
  let discount = 0, couponOk = false;
  if (coupon && sub >= (coupon.minSubtotal || 0)) {
    discount = coupon.type === "percent" ? Math.round(sub * coupon.value) / 100 : Math.min(sub, coupon.value);
    couponOk = true;
  }
  discount = +discount.toFixed(2);
  return { lines, sub, ship, discount, couponOk, total: +(sub - discount + ship).toFixed(2) };
}

/* ---------------- UI pieces ---------------- */
function productCard(p, opts = {}) {
  const sale = p.compareAt && p.compareAt > p.price;
  const eager = opts.eager ? "eager" : "lazy";
  const imgs = (p.images || []).map(img);
  const pic = imgs.length
    ? `<img src="${esc(imgs[0])}" alt="${esc(p.name)}" loading="${eager}">${imgs[1] ? `<img class="swap" src="${esc(imgs[1])}" alt="" loading="${eager}">` : ""}`
    : `<div class="ph"><img src="${MASCOT}" alt=""><small>Photo coming soon</small></div>`;
  return `<div class="card${imgs[1] ? " has-swap" : ""}${opts.className ? " " + opts.className : ""}">
    <a class="pic" href="/product.html?id=${encodeURIComponent(p.id)}">${sale ? '<span class="tag">Sale</span>' : p.isNew ? '<span class="tag new">New</span>' : ""}${p.example ? '<span class="tag ex" title="Example product — replace before selling">Example</span>' : ""}${pic}</a>
    <div class="body"><h3><a href="/product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
    <div class="row"><div class="price">${money(p.price)}${sale ? `<s>${money(p.compareAt)}</s>` : ""}</div>
    <button class="btn sm" data-add="${esc(p.id)}" data-name="${esc(p.name)}">Add to cart</button></div></div></div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-add]"); if (!b) return;
  e.preventDefault(); addToCart(b.dataset.add, 1, b.dataset.name);
});

function renderChrome(active) {
  const h = $("#site-header"), f = $("#site-footer");
  const q = new URLSearchParams(location.search).get("q") || "";
  if (h) h.innerHTML = `<div class="announce" id="announce">Free US shipping on orders over $35</div>
  <header class="site"><div class="wrap nav">
    <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="siteMenu"><span></span><span></span><span></span></button>
    <a class="logo" href="/index.html" aria-label="ARROW home"><b>ARROW</b>${ARROW_SVG}</a>
    <form class="search" action="/shop.html"><input name="q" placeholder="Search" value="${esc(q)}" aria-label="Search products"><button aria-label="Search">${ICONS.search.replace("<svg", '<svg width="20" height="20"')}</button></form>
    <ul class="menu" id="siteMenu">
      <li class="m-only drawer-head"><a class="logo" href="/index.html" aria-label="ARROW home"><b>ARROW</b>${ARROW_SVG}</a><button class="burger-x" type="button" aria-label="Close menu">&times;</button></li>
      <li><a href="/shop.html" class="${active === "shop" ? "on" : ""}">Shop</a></li>
      ${Object.entries(TABS).map(([k, x]) => `<li><a href="/shop.html?tab=${k}" class="${active === k ? "on" : ""}">${esc(x.label)}</a></li>`).join("")}
      <li><a href="/shop.html?view=new" class="${active === "new" ? "on" : ""}">New</a></li>
      <li><a href="/shop.html?view=bestsellers" class="${active === "best" ? "on" : ""}">Bestsellers</a></li>
      <li><a href="/shop.html?view=sale" class="${active === "sale" ? "on" : ""}">Sale</a></li>
      <li class="m-only sep"><a href="/about.html" class="${active === "about" ? "on" : ""}">Our story</a></li>
      <li class="m-only"><a href="/policies.html" class="${active === "help" ? "on" : ""}">Help &amp; policies</a></li>
      <li class="m-only"><a href="/about.html#contact">Contact us</a></li>
      <li class="m-only drawer-promo"><img src="${MASCOT}" alt=""><span>Free US shipping<br>on orders over $35</span></li>
    </ul>
    <div class="scrim" hidden></div>
    <a class="cart-link" href="/cart.html" aria-label="Cart">${ICONS.cart}<span class="cart-count">0</span></a>
  </div></header>`;
  if (f) f.innerHTML = `<footer class="site">
   <div class="news"><div class="wrap"><h3>Get 10% off your first order</h3>
     <form id="newsForm"><input type="email" required placeholder="Your email address" aria-label="Email"><button class="btn sm">Subscribe</button></form></div></div>
   <div class="wrap fcols">
     <div class="fbrand"><a class="logo" href="/index.html"><b>ARROW</b>${ARROW_SVG}</a><p>Fun finds for kids, home, pets &amp; more — simple things that spark a little curiosity.</p></div>
     <div><h4>Shop</h4><a href="/shop.html">All products</a>${Object.entries(TABS).map(([k, x]) => `<a href="/shop.html?tab=${k}">${esc(x.label)}</a>`).join("")}<a href="/shop.html?view=sale">Sale</a></div>
     <div><h4>Support</h4><a href="/policies.html#shipping">Shipping</a><a href="/policies.html#returns">Returns &amp; refunds</a><a href="/policies.html#faq">FAQ</a><a href="/about.html#contact">Contact us</a></div>
     <div><h4>About</h4><a href="/about.html">Our story</a><a href="/policies.html#privacy">Privacy policy</a><a href="/policies.html#terms">Terms of service</a><a href="mailto:hello@arrowbaby.com" class="email">hello@arrowbaby.com</a></div>
   </div>
   <div class="fbottom"><div class="wrap"><span>© ${new Date().getFullYear()} ARROW · All prices in USD</span>
     <div class="pays"><span class="pp">Pay<i>Pal</i></span><span>VISA</span><span>Mastercard</span><span>AMEX</span></div></div></div></footer>`;
  updateCount();
  // mobile menu (hamburger) — the button is only visible on small screens
  const hd = $("header.site");
  if (hd) {
    const burger = $(".burger", hd), scrim = $(".scrim", hd);
    const setOpen = (o) => { hd.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); scrim.hidden = !o; document.body.classList.toggle("noscroll", o); };
    burger.onclick = () => setOpen(!hd.classList.contains("open"));
    scrim.onclick = () => setOpen(false); $(".burger-x", hd).onclick = () => setOpen(false);
    $$(".menu a", hd).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
  }
  loadSettings().then((s) => {
    if (s.announcement) $("#announce").textContent = s.announcement;
    if (s.contactEmail) $$(".email").forEach((a) => { a.textContent = s.contactEmail; a.href = "mailto:" + s.contactEmail; });
  });
  const nf = $("#newsForm");
  if (nf) nf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = nf.querySelector("input").value;
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "newsletter", email }) });
      if (!r.ok) throw new Error((await r.json()).error);
    } catch (err) { console.warn("newsletter", err); }
    nf.outerHTML = '<div class="msg">Thanks! Use code <b>WELCOME10</b> for 10% off. 💚</div>';
  });
}
