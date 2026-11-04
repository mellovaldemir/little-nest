# Little Nest — Baby Accessories (v1)
Static HTML/CSS/JS + one Vercel serverless stub (`api/create-cj-order.js`).
Deploy: push to GitHub → import in Vercel (no build step, output = root). Or drag the folder to Netlify (the /api function is Vercel-style; on Netlify move it to netlify/functions).
Cart: localStorage. Payments: PayPal JS SDK sandbox (`client-id=sb`) in cart.html — replace with your live client-id.
