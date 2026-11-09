# End-to-end click-through + screenshots (1280px). Run with the dev server on :3010.
import json, re, sys, urllib.request
from playwright.sync_api import sync_playwright, expect
B = "http://localhost:3010"; S = "screenshots/"; PW = sys.argv[1]
log = lambda *a: print("✔", *a)
def shot(pg, name, full=True, keep_toast=False):
    pg.wait_for_timeout(500)
    if not keep_toast: pg.evaluate("document.querySelectorAll('.toast').forEach(t=>t.className='toast')"); pg.wait_for_timeout(350)
    pg.screenshot(path=S + name + ".png", full_page=full); log("screenshot", name)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 1280, "height": 860})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    # --- home + carousel
    pg.goto(B + "/", wait_until="networkidle")
    expect(pg.locator("#best .card")).to_have_count(8)
    t0 = pg.eval_on_selector("#slides", "e=>e.style.transform")
    pg.click(".car-arrow.next"); pg.wait_for_timeout(900)
    t1 = pg.eval_on_selector("#slides", "e=>e.style.transform")
    assert t0 != t1, "carousel did not move"; log("carousel next:", t0, "->", t1)
    pg.click(".dots button >> nth=2"); pg.wait_for_timeout(900)
    assert "200%" in pg.eval_on_selector("#slides", "e=>e.style.transform"); log("carousel dots ok")
    pg.click(".dots button >> nth=0"); pg.wait_for_timeout(900)
    shot(pg, "01-home")
    # --- shop filters
    pg.goto(B + "/shop.html", wait_until="networkidle")
    total = pg.locator("#grid .card").count()
    pg.check("#catf input[value=on-the-go]")
    n = pg.locator("#grid .card").count(); assert 0 < n < total; log(f"category filter: {total} -> {n}")
    pg.uncheck("#catf input[value=on-the-go]")
    pg.click(".switch"); n2 = pg.locator("#grid .card").count(); log("sale filter:", n2); assert 0 < n2 < total
    pg.click("#reset"); pg.select_option("#sort", "low")
    first = pg.locator("#grid .card h3").first.inner_text(); log("sorted low->high first:", first)
    shot(pg, "02-shop")
    # --- product page
    pg.goto(B + "/product.html?id=diaper-caddy", wait_until="networkidle")
    expect(pg.locator("#name")).to_have_text("Felt Diaper Caddy")
    pg.click("#plus"); pg.click("#addBtn"); pg.wait_for_timeout(300)
    assert pg.locator(".cart-count").first.inner_text() == "2"; log("added 2 caddies, cart count 2")
    shot(pg, "03-product")
    pg.goto(B + "/product.html?id=stroller-fan", wait_until="networkidle"); pg.click("#addBtn")
    # --- cart + coupon
    pg.goto(B + "/cart.html", wait_until="networkidle")
    pg.fill("#code", "nope"); pg.click("#couponForm button"); pg.wait_for_timeout(400)
    log("bad coupon msg:", pg.inner_text("#couponMsg"))
    pg.fill("#code", "welcome10"); pg.click("#couponForm button"); pg.wait_for_timeout(500)
    log("coupon:", pg.inner_text("#couponMsg"), "| total", pg.inner_text("#tot"), "| discount", pg.inner_text("#disc"))
    assert pg.inner_text("#disc") == "−$6.60" and pg.inner_text("#tot") == "$59.37"
    pg.wait_for_timeout(2500)  # let PayPal buttons render
    shot(pg, "04-cart")
    pg.goto(B + "/policies.html#shipping", wait_until="networkidle"); shot(pg, "05-policies")
    pg.goto(B + "/about.html", wait_until="networkidle"); shot(pg, "06-about")
    # --- admin login
    pg.goto(B + "/admin/", wait_until="networkidle")
    shot(pg, "07-admin-login", full=False)
    pg.fill("#pw", "wrong-password"); pg.click("#lf button"); pg.wait_for_timeout(1300)
    log("wrong pw:", pg.inner_text("#lerr"))
    pg.fill("#pw", PW); pg.click("#lf button"); pg.wait_for_selector(".stats")
    log("logged in")
    # --- products: edit price
    pg.goto(B + "/admin/#products"); pg.wait_for_selector("#ptable tr")
    shot(pg, "08-admin-products")
    pg.goto(B + "/admin/#product/diaper-caddy"); pg.wait_for_selector("#pf")
    pg.fill("input[name=price]", "24.99"); pg.wait_for_timeout(200)
    shot(pg, "09-admin-product-edit")
    pg.click("#saveBtn"); pg.wait_for_timeout(600)
    sp = ctx.new_page(); sp.goto(B + "/product.html?id=diaper-caddy", wait_until="networkidle")
    price = sp.inner_text("#price"); assert price.startswith("$24.99"), price; log("storefront now shows", price.split("$")[1]); sp.close()
    # hide/show toggle
    pg.goto(B + "/admin/#products"); pg.wait_for_selector("#ptable tr")
    pg.click("input[data-toggle=bath-duck] + i"); pg.wait_for_timeout(500)
    pub = json.load(urllib.request.urlopen(B + "/api/products")); assert not any(x["id"] == "bath-duck" for x in pub); log("hidden product removed from public API")
    pg.click("input[data-toggle=bath-duck] + i"); pg.wait_for_timeout(500)
    # --- coupons
    pg.goto(B + "/admin/#coupons"); pg.wait_for_selector("#cf")
    pg.fill("#cf input[name=code]", "summer20"); pg.fill("#cf input[name=value]", "20"); pg.click("#cf button"); pg.wait_for_timeout(700)
    c = json.load(urllib.request.urlopen(B + "/api/coupons?code=SUMMER20")); assert c["value"] == 20; log("new coupon validates in store:", c)
    shot(pg, "13-admin-coupons")
    # --- simulate a completed PayPal payment (what cart.html sends after capture)
    payload = {"paypalOrderId": "SANDBOX-TEST-123", "payer": {"name": {"given_name": "Jane", "surname": "Test"}, "email_address": "jane.test@example.com"},
               "shipping": {"name": {"full_name": "Jane Test"}, "address": {"address_line_1": "742 Evergreen Terrace", "admin_area_2": "Springfield", "admin_area_1": "IL", "postal_code": "62704", "country_code": "US"}},
               "items": [{"id": "diaper-caddy", "qty": 1}, {"id": "stroller-organizer", "qty": 1}], "coupon": "WELCOME10", "paidAmount": 42.28}
    r = urllib.request.Request(B + "/api/orders", data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}, method="POST")
    oid = json.load(urllib.request.urlopen(r))["id"]; log("simulated paid order", oid)
    pg.goto(B + "/admin/#orders"); pg.wait_for_selector("#otable tr")
    shot(pg, "10-admin-orders")
    pg.goto(B + "/admin/#order/" + oid); pg.wait_for_selector("#sendCj")
    pg.click("#sendCj"); pg.wait_for_selector("#goCj")
    assert pg.is_disabled("#goCj"); log("CJ confirm button disabled until checkbox ticked")
    pg.check("#iconfirm")
    shot(pg, "10b-admin-send-to-cj-confirm", full=False)
    pg.click("#goCj"); pg.wait_for_timeout(1200)
    assert "Sent to CJ" in pg.inner_text("main"); log("order sent to CJ (mock)")
    shot(pg, "10c-admin-order-detail")
    pg.goto(B + "/admin/#order/AR-SAMPLE1"); pg.wait_for_selector("#sendCj"); log("sample order viewable")
    # --- dashboard
    pg.goto(B + "/admin/#dashboard"); pg.wait_for_selector(".stats")
    shot(pg, "11-admin-dashboard")
    # --- banners: change announcement and check storefront
    pg.goto(B + "/admin/#banners"); pg.wait_for_selector("#ann")
    shot(pg, "12-admin-banners")
    old = pg.input_value("#ann"); pg.fill("#ann", "TEST announcement"); pg.click("#saveB"); pg.wait_for_timeout(500)
    sp = ctx.new_page(); sp.goto(B + "/", wait_until="networkidle"); a = sp.inner_text("#announce"); sp.close()
    assert a == "TEST announcement"; log("announcement updates storefront")
    pg.fill("#ann", old); pg.click("#saveB"); pg.wait_for_timeout(500)
    # revert test price
    pg.goto(B + "/admin/#product/diaper-caddy"); pg.wait_for_selector("#pf"); pg.fill("input[name=price]", "22.99"); pg.click("#saveBtn"); pg.wait_for_timeout(500)
    # mobile check
    m = b.new_page(viewport={"width": 390, "height": 844}); m.goto(B + "/", wait_until="networkidle"); m.screenshot(path=S + "14-home-mobile.png", full_page=True); log("screenshot 14-home-mobile")
    print("page errors:", errs or "none")
    b.close()
