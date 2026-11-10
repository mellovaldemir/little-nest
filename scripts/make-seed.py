#!/usr/bin/env python3
"""Rebuild products.json, settings.json and api/_lib/seed.json for the kids + home catalog.

Retail prices are estimates: about 2–2.5× landed cost (supplier cost + extra shipping),
rounded to end in .99. Each product has priceEstimate: true.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = []


def url(supplier, sid):
    host = "cjdropshipping.com" if supplier == "CJ" else "qksource.com"
    return f"https://{host}/product/x-p-{sid}.html"


def add(**kw):
    supplier = kw["supplier"]
    sid = kw["supplierId"]
    ship = float(kw.get("shipCost") or 0)
    p = {
        "id": kw["id"],
        "name": kw["name"],
        "price": kw["price"],
        "compareAt": kw.get("compareAt"),
        "cost": kw["cost"],
        "shipCost": ship,
        "priceEstimate": True,
        "tab": kw["tab"],
        "category": kw["category"],
        "description": kw["description"],
        "benefits": kw["benefits"],
        "images": kw.get("images") or [f"img/products/{kw['id']}.jpg"],
        "supplier": supplier,
        "supplierId": sid,
        "supplierUrl": url(supplier, sid),
        "cjLink": url(supplier, sid) if supplier == "CJ" else "",
        "cjSku": "",
        "active": True,
        "bestseller": kw.get("best", False),
        "isNew": kw.get("new", False),
        "example": False,
        "sort": kw["sort"],
    }
    P.append(p)


# ---- Kids · Learn & Play ----
add(id="wooden-peg-board", name="Wooden Peg Board Montessori", price=24.99, cost=10.00,
    tab="kids", category="learn-play", sort=1, best=True,
    supplier="QKsource", supplierId="1896473974832295938",
    description="A colorful wooden peg board with beads that slide along the wires. Kids practice colors, counting and fine motor skills at the table — no screens, no batteries.",
    benefits=["Wooden Montessori-style peg board", "Helps with colors, counting and coordination", "Ships from a US warehouse", "Free US shipping"])

add(id="baby-learning-tablet", name="Baby Learning Tablet", price=34.99, cost=15.04,
    tab="kids", category="learn-play", sort=2, best=True,
    supplier="QKsource", supplierId="1939541791168036865",
    description="A kid-sized learning tablet that introduces letters, numbers and simple words with lights and sounds. Built for little hands and curious toddlers.",
    benefits=["ABC and number activities", "Lights and sounds keep kids engaged", "Sized for small hands", "Free US shipping"])

add(id="educational-toys-3-7", name="Educational Learning Toys (Ages 3–7)", price=22.99, cost=9.82,
    tab="kids", category="learn-play", sort=3, best=True,
    supplier="QKsource", supplierId="1955904529399447554",
    description="A set of hands-on learning toys for preschool and early elementary kids. Mix of matching, sorting and early-thinking games to pull out on a rainy afternoon.",
    benefits=["Made for ages 3–7", "Sorting and matching play", "Great desk or travel activity", "Free US shipping"])

add(id="educational-toys-2-7", name="Educational Learning Toys (Ages 2–7)", price=24.99, cost=10.28,
    tab="kids", category="learn-play", sort=4,
    supplier="QKsource", supplierId="1955550794640093185",
    description="An early-learning toy set that grows with your child from toddler to early school age. Simple pieces, bright colors and plenty to explore.",
    benefits=["For ages 2–7", "Bright, easy-to-grasp pieces", "Encourages independent play", "Free US shipping"])

add(id="logical-road-builder", name="Kids Logical Road Builder", price=74.99, cost=35.03,
    tab="kids", category="learn-play", sort=5,
    supplier="QKsource", supplierId="1967474941410299906",
    description="A STEM puzzle that lets kids build roads, plan routes and watch their ideas click into place. A longer-lasting project for puzzle lovers.",
    benefits=["STEM road-building puzzle", "Builds planning and logic skills", "Satisfying click-together pieces", "Free US shipping"])

add(id="talking-flash-cards", name="Talking Flash Cards (448 Words)", price=22.99, cost=9.90,
    tab="kids", category="learn-play", sort=6, best=True,
    supplier="QKsource", supplierId="1965710467457343490",
    description="Talking flash cards with 448 sight words and pictures. Kids hear the word as they see it — a simple way to practice reading and vocabulary.",
    benefits=["448 sight words", "Hear-and-see learning", "Compact for travel or the sofa", "Free US shipping"])

add(id="role-play-set", name="32-Piece Role Play Set", price=99.99, cost=48.99,
    tab="kids", category="learn-play", sort=7, new=True,
    supplier="QKsource", supplierId="2102810505147285506",
    description="A 32-piece dress-up and pretend-play set for kids who love to act out jobs, stories and everyday adventures. Plenty of pieces to share.",
    benefits=["32-piece pretend-play set", "Encourages imagination and sharing", "Fun for siblings or playdates", "Free US shipping"])

add(id="microscope-science-toy", name="Microscope Science Toy", price=49.99, cost=22.35,
    tab="kids", category="learn-play", sort=8, best=True,
    supplier="CJ", supplierId="1879356539223822337",
    description="A kid-friendly microscope that turns leaves, fabric and kitchen spices into a science moment. A curious gift for the child who asks “why?” a lot.",
    benefits=["Real close-up viewing for kids", "Easy intro to science at home", "Gift-ready for curious minds", "Free US shipping"])

# ---- Kids · Room & Bedtime ----
add(id="bunny-night-light", name="Bunny Night Light", price=36.99, cost=16.00,
    tab="kids", category="room-bedtime", sort=9,
    supplier="QKsource", supplierId="1989234503601668097",
    description="A soft bunny night light that glows gently at bedtime. Cute enough to sit on a nightstand and calm enough for a dark room.",
    benefits=["Gentle glow for bedtime", "Sweet bunny design", "Sits on a nightstand or shelf", "Free US shipping"])

add(id="calf-alarm-clock", name="Calf Alarm Clock for Kids", price=24.99, cost=10.59,
    tab="kids", category="room-bedtime", sort=10,
    supplier="CJ", supplierId="1860255223420702720",
    description="A cheerful calf-shaped alarm clock that makes getting up a little more fun. Easy to read and sized for a kid’s bedside table.",
    benefits=["Kid-friendly calf design", "Simple bedside alarm", "A sweet room accent", "Free US shipping"])

# ---- Kids · On the Go ----
add(id="astronaut-water-bottle", name="Astronaut Water Bottle", price=29.99, cost=14.00,
    tab="kids", category="on-the-go", sort=11,
    supplier="QKsource", supplierId="1985589224236560385",
    description="A white astronaut-themed water bottle that makes drinking water feel like a mission. Fun for school bags, parks and car rides.",
    benefits=["Playful astronaut design", "Everyday kids’ water bottle", "Easy to toss in a backpack", "Free US shipping"])

add(id="steel-kids-bottle", name="12oz Stainless Steel Kids Bottle", price=39.99, cost=17.84,
    tab="kids", category="on-the-go", sort=12,
    supplier="QKsource", supplierId="2044698223284813826",
    description="A 12oz stainless steel bottle sized for kids. Tough enough for lunchboxes and everyday spills, without feeling oversized.",
    benefits=["12oz stainless steel", "Kid-sized for small hands", "Everyday school and park bottle", "Free US shipping"])

add(id="snowball-tool-kit", name="15-Piece Winter Snowball Tool Kit", price=79.99, cost=36.93,
    tab="kids", category="on-the-go", sort=13,
    supplier="QKsource", supplierId="1957723247874834433",
    description="A 15-piece snowball tool kit for building, scooping and friendly snowball play. The kind of winter find that makes everyone want to go outside.",
    benefits=["15-piece winter play kit", "Scoop, stack and launch snowballs", "Outdoor family fun", "Free US shipping"])

add(id="trampoline-sprinkler", name="Kids Trampoline Sprinkler", price=39.99, cost=18.13,
    tab="kids", category="on-the-go", sort=14,
    supplier="QKsource", supplierId="2045053070108311553",
    description="A sprinkler that clips onto a trampoline so jump time becomes a backyard splash session. Simple summer fun for hot days.",
    benefits=["Turns a trampoline into a splash zone", "Easy attach-and-play setup", "Backyard summer favorite", "Free US shipping"])

# ---- Kids · Fidgets & Teens ----
add(id="fidget-balls-9pc", name="9-Piece 3D Printed Fidget Balls", price=17.99, cost=3.99, shipCost=4.00,
    tab="kids", category="fidgets-teens", sort=15, new=True,
    supplier="QKsource", supplierId="2091767723920121858",
    description="A set of nine colorful 3D-printed fidget balls with stretchy bands. Push, pull and pass them around — a pocket-friendly stress toy for teens and desks.",
    benefits=["9 colorful fidget balls", "Push-and-pull sensory play", "Handy for desks, cars and backpacks", "Ships from the US"])

add(id="glow-fidget-ball", name="Glow-in-the-Dark Press Fidget Ball (12+)", price=15.99, cost=6.99,
    tab="kids", category="fidgets-teens", sort=16, new=True,
    supplier="QKsource", supplierId="2092878797670481921",
    description="A compact press fidget ball that glows in the dark. Made for ages 12 and up — a quiet, pocket-size fidget for travel, homework and late-night car rides.",
    benefits=["Glow-in-the-dark finish", "For teens and adults (ages 12+)", "Quiet, pocket-size fidget", "Free US shipping"])

add(id="bicycle-chain-fidgets", name="8-Piece Bicycle-Chain Fidget Set", price=17.99, cost=7.81,
    tab="kids", category="fidgets-teens", sort=17, new=True,
    supplier="QKsource", supplierId="1869276080876965888",
    description="Eight bicycle-chain style fidgets that spin, twist and click. A satisfying little set for teens who like something to do with their hands.",
    benefits=["8 fidget toys in one set", "Spin, twist and click", "Great desk or backpack extras", "Free US shipping"])

# ---- Home · Cleaning ----
add(id="crevice-cleaning-brushes", name="3-Piece Crevice Cleaning Brush Set", price=19.99, cost=8.90,
    tab="home", category="cleaning", sort=18,
    supplier="QKsource", supplierId="2003357435441360897",
    description="Three hard-bristle brushes made for the gaps you always skip: window tracks, bathroom edges and tight kitchen corners. Simple, oddly satisfying cleaning.",
    benefits=["3 brushes for tight gaps", "Window tracks, sinks and tiles", "Hard bristles that reach in", "Free US shipping"])

# ---- Home · Kitchen ----
add(id="kitchen-sink-caddy", name="Kitchen Sink Caddy & Sponge Holder", price=34.99, cost=15.12,
    tab="home", category="kitchen", sort=19,
    supplier="QKsource", supplierId="1956541096810119170",
    description="A sink-side caddy that keeps the sponge, brush and soap from taking over the counter. One little organizer that makes the sink look instantly calmer.",
    benefits=["Holds sponge and sink tools", "Keeps the counter clearer", "Everyday kitchen organizer", "Free US shipping"])

# ---- Home · Desk & Cable ----
add(id="magnetic-cable-clips", name="Magnetic Cable Clips (6-Pack)", price=26.99, cost=12.21,
    tab="home", category="desk-cable", sort=20, best=True,
    supplier="QKsource", supplierId="1965621056973606913",
    description="Six magnetic clips that grab charging cables and keep them from sliding off the nightstand, desk or car console. The small fix you notice every day.",
    benefits=["6 magnetic clips", "Stick-on holder for desks, walls and cars", "Stops cables from disappearing", "Free US shipping"])

add(id="ice-cream-pen-holder", name="Melting Ice-Cream Pen Holder", price=14.99, cost=2.60, shipCost=4.00,
    tab="home", category="desk-cable", sort=21, new=True,
    supplier="QKsource", supplierId="2094997253084516353",
    description="A 3D-printed pen holder that looks like a melting ice-cream cone. A tiny desk surprise that actually holds pens and pencils.",
    benefits=["Melting ice-cream design", "Holds pens and pencils", "Fun desk accent", "Ships from the US"])

add(id="cat-phone-holder", name="Cat Phone Holder", price=19.99, cost=4.80, shipCost=4.00,
    tab="home", category="desk-cable", sort=22, new=True,
    supplier="QKsource", supplierId="2103067398688845825",
    description="A cute 3D-printed cat that holds your phone on the desk while you watch a recipe, a show or a video call. Functional and a little ridiculous — in a good way.",
    benefits=["Cat-shaped phone stand", "Keeps a phone upright on the desk", "Small, giftable desk decor", "Ships from the US"])


settings = {
    "announcement": "Free US shipping on orders over $35",
    "contactEmail": "hello@arrowbaby.com",
    "slides": [
        {"image": "img/slides/slide1.jpg", "headline": "Fun finds for kids & home", "subtitle": "Curious little things worth adding to the cart", "buttonText": "Shop the Quiver", "buttonLink": "shop.html"},
        {"image": "img/slides/slide2.jpg", "headline": "Free shipping over $35", "subtitle": "Fast delivery from US warehouses", "buttonText": "Start shopping", "buttonLink": "shop.html"},
        {"image": "img/slides/slide3.jpg", "headline": "Play that actually teaches", "subtitle": "Wooden Peg Board Montessori · $24.99", "buttonText": "Shop now", "buttonLink": "product.html?id=wooden-peg-board"},
    ],
}
coupons = [
    {"code": "WELCOME10", "type": "percent", "value": 10, "minSubtotal": 0, "active": True, "createdAt": "2026-11-09T12:00:00.000Z"},
    {"code": "BUNDLE15", "type": "percent", "value": 15, "minSubtotal": 50, "active": True, "createdAt": "2026-11-09T12:00:00.000Z"},
]
orders = [{
    "id": "AR-SAMPLE1", "sample": True, "createdAt": "2026-11-08T15:20:00.000Z", "status": "new",
    "paypalOrderId": "SAMPLE-NOT-REAL",
    "customer": {"name": "Sample Customer (test data)", "email": "sample@example.com"},
    "address": {"address_line_1": "123 Example St", "admin_area_2": "Austin", "admin_area_1": "TX", "postal_code": "73301", "country_code": "US"},
    "items": [
        {"id": "wooden-peg-board", "name": "Wooden Peg Board Montessori", "price": 24.99, "cost": 10.00, "qty": 1, "cjSku": "", "cjLink": ""},
        {"id": "magnetic-cable-clips", "name": "Magnetic Cable Clips (6-Pack)", "price": 26.99, "cost": 12.21, "qty": 1, "cjSku": "", "cjLink": ""},
    ],
    "subtotal": 51.98, "discount": 0, "coupon": None, "shipping": 0, "total": 51.98,
    "history": [{"at": "2026-11-08T15:20:00.000Z", "status": "new"}],
}]

(ROOT / "api/_lib/seed.json").write_text(json.dumps({"products": P, "settings": settings, "coupons": coupons, "orders": orders}, indent=1, ensure_ascii=False) + "\n")
(ROOT / "data/products.json").write_text(json.dumps(P, indent=1, ensure_ascii=False) + "\n")
(ROOT / "data/settings.json").write_text(json.dumps(settings, indent=1, ensure_ascii=False) + "\n")

print(f"Wrote {len(P)} products")
for p in P:
    landed = round(p["cost"] + p["shipCost"], 2)
    mult = round(p["price"] / landed, 2) if landed else 0
    print(f"  {p['id']:28} ${p['price']:<6}  landed ${landed:<6}  {mult}x  {p['tab']}/{p['category']}")
