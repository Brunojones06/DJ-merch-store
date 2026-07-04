# DIANA — Official Merch Store

Dark punk-sticker themed artist site with a working merch store: shopping bag, Stripe Checkout, tour dates and mailing-list signup.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, featured single, featured merch, mailing list |
| `shop.html` | Store — product grid, category filters, price/latest sorting, add to bag |
| `tour.html` | Tour dates with ticket links |
| `success.html` | Post-payment confirmation (clears the bag) |
| `cart.js` | Shared bag: localStorage state, slide-out panel, Stripe checkout call |
| `api/checkout.js` | Vercel serverless function — creates the Stripe Checkout Session |

No build step. Static HTML + Tailwind CDN; the only dependency (`stripe`) is used by the serverless function.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo → deploy (defaults are fine).
3. Project → **Settings → Environment Variables** → add:
   - `STRIPE_SECRET_KEY` = your Stripe secret key (`sk_test_...` for test mode)
4. Redeploy so the function picks up the key.

### Test a payment

Test mode card: `4242 4242 4242 4242`, any future expiry, any CVC.
Success redirects to `/success.html`; cancel returns to `/shop.html`.

## Editing products

Product data lives in **one place**: the `DIANA_CATALOG` array at the top of `cart.js`
(name, price shown on site, image, category, badge, Stripe Price ID).
When adding/removing a product, also update the `ALLOWED_PRICE_IDS` allowlist in
`api/checkout.js` — it's a server-side guard so only known prices can be checked out.

> Displayed prices are cosmetic; the amount actually charged comes from the
> Stripe Price object. Keep them in sync.

## Local development

The site itself can be opened directly (`index.html`) — everything works except
checkout, which needs the serverless function. For full local testing:

```bash
npm install
npx vercel dev   # needs STRIPE_SECRET_KEY in .env or `vercel env pull`
```
