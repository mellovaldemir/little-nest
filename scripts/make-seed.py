#!/usr/bin/env python3
"""Rebuild products.json, settings.json and api/_lib/seed.json for the ARROW catalog.

Retail prices are estimates: about 2–2.5× landed cost (supplier cost + extra shipping),
rounded to end in .99. Each product has priceEstimate: true.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = []

def product_images(pid):
    out = []
    main = ROOT / f"img/products/{pid}.webp"
    if main.exists():
        out.append(f"img/products/{pid}.webp")
    for i in range(2, 8):
        extra = ROOT / f"img/products/{pid}-{i}.webp"
        if extra.exists():
            out.append(f"img/products/{pid}-{i}.webp")
    return out or [f"img/products/{pid}.webp"]




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
        "images": kw.get("images") or product_images(kw["id"]),
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



# ---- Pets · Feeding & Play ----
add(id="cat-slow-feeder-bowl", name="2-in-1 Cat Slow Feeder Bowl", price=36.99, cost=16.42,
    tab="pets", category="feeding-play", sort=23, best=True, new=True,
    supplier="QKsource", supplierId="2044312503208022017",
    description="A dual-mode bowl that slows down fast eaters without making mealtime a chore. Switch between a quicker meal and a slower puzzle so your cat actually chews.",
    benefits=["Switchable fast and slow modes", "Helps reduce gulping", "Everyday feeding bowl", "Free US shipping"])

add(id="dog-puzzle-feeder", name="3-in-1 Dog Puzzle Feeder", price=44.99, cost=19.00,
    tab="pets", category="feeding-play", sort=24, new=True,
    supplier="QKsource", supplierId="2008459342455554049",
    description="A rotating slow-feeder bowl, lick mat and foraging puzzle in one. It turns dinner into a short brain game and keeps eager eaters from finishing in two bites.",
    benefits=["Bowl, lick mat and puzzle in one", "Slows down fast eaters", "Mental stimulation at mealtime", "Free US shipping"])

add(id="cat-toy-pillow", name="Cat Toy Pillow", price=29.99, cost=6.40, shipCost=7.16,
    tab="pets", category="feeding-play", sort=25, new=True,
    supplier="QKsource", supplierId="2117536666452176897",
    description="A soft little pillow toy for batting, loafing and afternoon zoomies. Simple, cute, and the kind of thing a cat actually notices.",
    benefits=["Soft pillow-style cat toy", "Easy to bat around the house", "Small enough for a window perch", "Ships from the US"])

# ---- Pets · Grooming & Cleanup ----
add(id="mini-pet-hair-remover", name="Mini Reusable Pet Hair Remover", price=24.99, cost=11.12,
    tab="pets", category="grooming-cleanup", sort=26, best=True, new=True,
    supplier="QKsource", supplierId="1903346609047252993",
    description="A pocket-size reusable hair remover for the couch, the car seat and the sweater you just sat on. No refill rolls — just brush, empty and go again.",
    benefits=["Reusable — no sticky sheets", "Works on couches, rugs and clothes", "Small enough to keep in a drawer", "Free US shipping"])

add(id="pet-hair-lint-rollers", name="120-Sheet Pet Hair Lint Rollers", price=12.99, cost=5.50,
    tab="pets", category="grooming-cleanup", sort=27, new=True,
    supplier="QKsource", supplierId="2050128392833576961",
    description="A mega-value lint roller set with 120 sticky sheets for pet hair on clothes, sofas and car seats. The simple cleanup tool you reach for every day.",
    benefits=["120 extra-sticky sheets", "Picks up hair from fabric and upholstery", "Everyday pet-hair cleanup", "Free US shipping"])

add(id="home-cleaning-pet-hair-remover", name="Home-Cleaning Pet Hair Remover", price=32.99, cost=13.99,
    tab="pets", category="grooming-cleanup", sort=28, new=True,
    supplier="QKsource", supplierId="2114436779738726402",
    description="A larger pet-hair remover made for sofas, carpets and the spots the vacuum always seems to miss. One pass and the fur pile looks a lot more manageable.",
    benefits=["Built for furniture and floors", "Reusable hair pickup", "Quick tidy between vacuum days", "Free US shipping"])

# ---- Car · Organize ----
add(id="car-seat-gap-organizer", name="Car Seat-Gap Storage Box", price=36.99, cost=16.24,
    tab="car", category="car-organize", sort=29, best=True, new=True,
    supplier="QKsource", supplierId="1996417407486447618",
    description="A slim organizer that slips into the gap between the seat and the center console. Phones, cards and snacks stop disappearing down the side — and you gain a little extra storage.",
    benefits=["Fills the seat-to-console gap", "Holds phone, cards and small extras", "Keeps the cabin tidier", "Free US shipping"])

add(id="headrest-hanger-hooks", name="2-Piece Headrest Hanger Hooks", price=27.99, cost=12.44,
    tab="car", category="car-organize", sort=30, new=True,
    supplier="QKsource", supplierId="1985604446154305537",
    description="Two hooks that clip onto the headrest posts so purses, grocery bags and jackets have somewhere to live instead of sliding across the back seat.",
    benefits=["Set of 2 headrest hooks", "Holds bags, purses and jackets", "Clips on without tools", "Free US shipping"])

# ---- Car · Clean ----
add(id="car-vent-cleaning-gel", name="Interior Crevice/Vent Cleaning Gel", price=39.99, cost=16.99,
    tab="car", category="car-clean", sort=31, new=True,
    supplier="QKsource", supplierId="2099778828215816193",
    description="A detailing putty that presses into vents, cup holders and the tiny gaps a cloth cannot reach. Press, lift, and the dust comes out with it.",
    benefits=["Picks up dust from vents and crevices", "Reusable cleaning gel", "No sprays or extra tools", "Free US shipping"])

add(id="car-interior-plastic-gel", name="Car Interior Plastic Cleaning Gel", price=32.99, cost=13.99,
    tab="car", category="car-clean", sort=32, new=True,
    supplier="QKsource", supplierId="2113691273764990977",
    description="A gentle gel made for interior plastic — the dashboard, door panels and those textured bits that collect dust. Easy to use and kinder than a harsh spray.",
    benefits=["Gentle on interior plastic", "Lifts dust from textured surfaces", "Simple press-and-lift cleanup", "Free US shipping"])

# ---- Car · Mounts ----
add(id="rearview-mirror-phone-mount", name="Universal Rearview-Mirror Phone Mount", price=21.99, cost=9.51,
    tab="car", category="car-mounts", sort=33, new=True,
    supplier="QKsource", supplierId="1941070939508797441",
    description="A universal cradle that clips onto the rearview mirror so your phone or GPS sits in your line of sight — without another suction cup on the windshield.",
    benefits=["Clips onto the rearview mirror", "Holds most phones and small GPS units", "No sticky dashboard pad", "Free US shipping"])

# ---- Geek & Gamer · Setup & Stands ----
add(id="mechanical-hand-stand", name="Mechanical Hand Controller Stand", price=36.99, cost=16.50,
    tab="geek", category="setup-stands", sort=34, best=True, new=True,
    supplier="QKsource", supplierId="2059153405504704513",
    description="A sculptural mechanical hand that holds a controller, headphones or a necklace when you are not using them. Desk setup and conversation piece in one.",
    benefits=["Holds a controller or headphones", "Robot-hand desk sculpture", "Doubles as a jewelry stand", "Free US shipping"])

# ---- Geek & Gamer · Wall & Room Decor ----
add(id="gamer-keep-out-sign", name="Gamer at Play — Keep Out Metal Sign", price=24.99, cost=11.00,
    tab="geek", category="wall-decor", sort=35, new=True,
    supplier="QKsource", supplierId="2116421589253939201",
    description="A vintage-style metal sign that says what every gamer means: keep out, battling enemies, do not disturb. Easy wall decor for a bedroom, dorm or man cave.",
    benefits=["Printed metal wall sign", "Classic “gamer at play” copy", "Ready to hang", "Free US shipping"])

add(id="vintage-arcade-tin-sign", name="Vintage Arcade Tin Sign", price=16.99, cost=7.51,
    tab="geek", category="wall-decor", sort=36, new=True,
    supplier="QKsource", supplierId="2118207565498998786",
    description="A small tin sign with vintage arcade energy — the kind of wall accent that makes a desk corner or game shelf feel finished.",
    benefits=["Retro arcade wall accent", "Lightweight tin sign", "Easy to hang in a room or dorm", "Free US shipping"])

# ---- Geek & Gamer · Desk Fun ----
add(id="cat-phone-holder", name="Cat Phone Holder", price=19.99, cost=4.80, shipCost=4.00,
    tab="geek", category="desk-fun", sort=37, new=True,
    supplier="QKsource", supplierId="2103067398688845825",
    description="A cute 3D-printed cat that holds your phone on the desk while you watch a recipe, a show or a video call. Functional and a little ridiculous — in a good way.",
    benefits=["Cat-shaped phone stand", "Keeps a phone upright on the desk", "Small, giftable desk decor", "Ships from the US"])

add(id="skeleton-hand-bookend", name="Skeleton-Hand Bookend", price=29.99, cost=8.90, shipCost=4.00,
    tab="geek", category="desk-fun", sort=38, new=True,
    supplier="QKsource", supplierId="2094681338373890049",
    description="A skeleton hand that holds up a book, a game case or a stack of comics. Slightly spooky desk decor that is actually useful.",
    benefits=["Holds books and game cases", "Skeleton-hand design", "Fun shelf or desk accent", "Ships from the US"])

add(id="duck-pen-holder", name="3D-Printed Duck Pen Holder", price=32.99, cost=10.20, shipCost=4.00,
    tab="geek", category="desk-fun", sort=39, new=True,
    supplier="QKsource", supplierId="2102683560978309121",
    description="A 3D-printed duck that holds pens on the desk. Same “how did I not own this” energy as the melting ice-cream holder — just slightly more unhinged.",
    benefits=["Duck-shaped pen cup", "Holds pens and pencils", "A desk accent people notice", "Ships from the US"])


settings = {
    "announcement": "Free US shipping on orders over $35",
    "contactEmail": "hello@arrowbaby.com",
    "slides": [
        {"image": "img/slides/slide1.jpg", "headline": "Fun finds for kids, home, pets & more", "subtitle": "Curious little things worth adding to the cart", "buttonText": "Shop the Quiver", "buttonLink": "shop.html"},
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
