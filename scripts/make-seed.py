import json
P=[]
def add(id,name,price,cat,cost,desc,benefits,images=None,compare=None,best=False,new=False,example=False,sort=0):
    P.append(dict(id=id,name=name,price=price,compareAt=compare,cost=cost,category=cat,description=desc,benefits=benefits,
      images=images or [],cjLink="",cjSku="",active=True,bestseller=best,isNew=new,example=example,sort=sort))
add("diaper-caddy","Felt Diaper Caddy",22.99,"nursery",9.50,
 "Diaper changes go smoother when everything is in reach. Our Felt Diaper Caddy organizes diapers, wipes, lotions and small essentials in a soft, neutral basket that looks at home on a changing table, dresser, or car seat. Approx. 15 × 9 × 7 in. Spot clean only.",
 ["Keeps diapers, wipes and creams in one portable spot","Removable dividers — customize the compartments","Soft, sturdy felt that holds its shape","Carry handle for easy room-to-room changes"],
 ["img/diaper-caddy.jpg","img/hero.jpg"],compare=29.99,best=True,sort=1)
add("stroller-organizer","Stroller Organizer with Cup Holders",21.99,"on-the-go",8.20,
 "Keep your phone, keys, snacks and two drinks right at the handlebar. Fits most strollers with adjustable straps and folds flat when you don't need it.",
 ["Two insulated cup holders","Zip pocket for phone and keys","Universal adjustable straps","Folds flat with the stroller"],["img/stroller-organizer.jpg"],best=True,sort=2)
add("stroller-fan","Clip-on Stroller Fan",19.99,"on-the-go",6.90,
 "A quiet, rechargeable fan with a flexible clip that grips stroller frames, car seats and crib rails. Keeps little ones cool on warm days.",
 ["Quiet 3-speed motor","Flexible clip with 360° rotation","USB rechargeable","Finger-safe grille"],["img/stroller-fan.jpg"],best=True,sort=3)
add("baby-proofing-kit","Baby Proofing Kit",14.99,"safety",4.80,
 "Everything you need to start baby-proofing in one box: outlet covers, corner guards and cabinet latches. No drilling needed.",
 ["Outlet covers, corner guards and cabinet latches","Adhesive install — no tools","Clear finish blends with furniture","Easy for adults to remove"],["img/baby-proofing-kit.jpg"],best=True,sort=4)
ex="EXAMPLE PRODUCT — replace photo, text, price and cost with the real CJ item before selling. "
add("potty-seat-step","Potty Training Seat with Step Ladder",34.99,"bath",14.00,ex+"Foldable potty seat with a non-slip step ladder that fits most standard toilets.",["Non-slip steps","Soft padded seat","Folds for storage"],compare=45.00,best=True,example=True,sort=5)
add("stroller-cup-holder","Stroller Cup & Phone Holder",16.99,"on-the-go",5.50,ex+"Clamp-on holder for a drink and a phone, adjustable for most stroller bars.",["Fits most stroller bars","Holds cups and bottles","Phone slot"],best=True,example=True,sort=6)
add("tummy-time-mat","LED Tummy Time Water Mat",19.99,"nursery",6.00,ex+"Inflatable water play mat with floating sea friends for tummy time.",["Leak-resistant","Floating sea friends","Easy to inflate"],best=True,example=True,sort=7)
add("gift-crate","Wooden Baby Gift Crate",39.99,"nursery",15.00,ex+"Natural wood crate for storing toys, blankets or putting together a baby shower gift.",["Natural pine wood","Rounded edges","Great for gifts"],compare=50.00,best=True,example=True,sort=8)
add("baby-carrier","Ergonomic Baby Carrier",45.99,"on-the-go",19.00,ex+"Padded carrier with lumbar support for front carrying.",["Lumbar support","Padded straps","Breathable fabric"],new=True,example=True,sort=9)
add("muslin-swaddle","Organic Muslin Swaddle",24.99,"nursery",7.50,ex+"Soft, breathable organic cotton muslin swaddle blanket.",["Organic cotton","Breathable","Gets softer with every wash"],new=True,example=True,sort=10)
add("teething-ring","Wooden Teething Ring",12.99,"nursery",3.20,ex+"Smooth wooden teething ring with a soft silicone charm.",["Natural wood","Food-grade silicone","Easy to grip"],new=True,example=True,sort=11)
add("insulated-bottle","Insulated Baby Bottle",18.99,"on-the-go",6.80,ex+"Keeps milk warm or cool on the go.",["Double-wall insulation","Leak-proof lid","BPA-free"],new=True,example=True,sort=12)
add("bath-duck","Yellow Bath Duck",8.99,"bath",1.90,ex+"Classic squeaky bath duck for bath-time fun.",["Soft and squeezable","Floats upright"],example=True,sort=13)
add("outlet-covers","Outlet Covers (24-pack)",9.99,"safety",2.40,ex+"Clear plug-in outlet covers to keep little fingers safe.",["24 covers","Easy for adults to remove"],compare=12.99,example=True,sort=14)
settings={"announcement":"Free US shipping on orders over $35","contactEmail":"hello@arrowbaby.com",
 "slides":[
  {"image":"img/slides/slide1.jpg","headline":"Aim for little adventures","subtitle":"Simple, safe accessories for busy parents","buttonText":"Shop the Quiver","buttonLink":"shop.html"},
  {"image":"img/slides/slide2.jpg","headline":"Free shipping over $35","subtitle":"Fast delivery from US warehouses","buttonText":"Start shopping","buttonLink":"shop.html"},
  {"image":"img/slides/slide3.jpg","headline":"The Diaper Caddy","subtitle":"Everything in reach, every change · $22.99","buttonText":"Shop now","buttonLink":"product.html?id=diaper-caddy"}]}
coupons=[{"code":"WELCOME10","type":"percent","value":10,"minSubtotal":0,"active":True,"createdAt":"2026-11-09T12:00:00.000Z"},
 {"code":"BUNDLE15","type":"percent","value":15,"minSubtotal":50,"active":True,"createdAt":"2026-11-09T12:00:00.000Z"}]
orders=[{"id":"AR-SAMPLE1","sample":True,"createdAt":"2026-11-08T15:20:00.000Z","status":"new","paypalOrderId":"SAMPLE-NOT-REAL",
 "customer":{"name":"Sample Customer (test data)","email":"sample@example.com"},
 "address":{"address_line_1":"123 Example St","admin_area_2":"Austin","admin_area_1":"TX","postal_code":"73301","country_code":"US"},
 "items":[{"id":"diaper-caddy","name":"Felt Diaper Caddy","price":22.99,"cost":9.5,"qty":1,"cjSku":"","cjLink":""},
          {"id":"stroller-fan","name":"Clip-on Stroller Fan","price":19.99,"cost":6.9,"qty":1,"cjSku":"","cjLink":""}],
 "subtotal":42.98,"discount":0,"coupon":None,"shipping":0,"total":42.98,"history":[{"at":"2026-11-08T15:20:00.000Z","status":"new"}]}]
json.dump({"products":P,"settings":settings,"coupons":coupons,"orders":orders},open('../api/_lib/seed.json','w'),indent=1,ensure_ascii=False)
# static fallback for the storefront (public fields only)
pub=[{k:v for k,v in p.items() if k not in("cost","cjLink","cjSku")} for p in P]
json.dump(pub,open('../data/products.json','w'),indent=1,ensure_ascii=False)
json.dump(settings,open('../data/settings.json','w'),indent=1,ensure_ascii=False)
print(len(P))
