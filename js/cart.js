const PRODUCTS={
 "diaper-caddy":{name:"Felt Diaper Caddy",price:22.99,img:"img/diaper-caddy.jpg",url:"product-diaper-caddy.html"},
 "stroller-organizer":{name:"Stroller Organizer with Cup Holders",price:21.99,img:"img/stroller-organizer.jpg",url:"#"},
 "stroller-fan":{name:"Clip-on Stroller Fan",price:19.99,img:"img/stroller-fan.jpg",url:"#"},
 "baby-proofing-kit":{name:"Baby Proofing Kit",price:14.99,img:"img/baby-proofing-kit.jpg",url:"#"}};
const FREE_SHIP=35,SHIP_FEE=4.99,KEY="littlenest_cart";
const getCart=()=>JSON.parse(localStorage.getItem(KEY)||"[]");
const saveCart=c=>{localStorage.setItem(KEY,JSON.stringify(c));updateCount()};
function addToCart(id,qty=1){const c=getCart();const i=c.find(x=>x.id===id);i?i.qty+=qty:c.push({id,qty});saveCart(c);toast(`${PRODUCTS[id].name} added to cart`)}
function setQty(id,qty){let c=getCart();c=c.map(x=>x.id===id?{...x,qty}:x).filter(x=>x.qty>0);saveCart(c)}
function totals(){const sub=getCart().reduce((s,x)=>s+PRODUCTS[x.id].price*x.qty,0);const ship=sub===0||sub>=FREE_SHIP?0:SHIP_FEE;return{sub,ship,total:+(sub+ship).toFixed(2)}}
function updateCount(){const n=getCart().reduce((s,x)=>s+x.qty,0);document.querySelectorAll(".cart-count").forEach(e=>e.textContent=n)}
function toast(m){let t=document.querySelector(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.append(t)}t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
const money=n=>"$"+n.toFixed(2);
document.addEventListener("DOMContentLoaded",()=>{updateCount();document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{const q=document.getElementById("qty");addToCart(b.dataset.add,q?Math.max(1,parseInt(q.value)||1):1)}))});
