// Vercel serverless function: creates a single Stripe Checkout Session
// for the whole bag. Secret key comes from the STRIPE_SECRET_KEY env var
// (set in Vercel project settings) — never hardcoded.

const Stripe = require("stripe");

// Server-side allowlist so the client can only check out known products.
const ALLOWED_PRICE_IDS = new Set([
  "price_1Tos7wKIvvX72lLe6xszc9Gx", // Midnight Static Tee
  "price_1Tos8uKIvvX72lLecqUViMng", // Static Bomber
  "price_1Tos9WKIvvX72lLefbuMHdvM", // Diana Trucker Cap
  "price_1TosAJKIvvX72lLeBsdMeRk5", // Night Shift Cargo Pants
  "price_1TosCJKIvvX72lLeCOyvRV6T"  // Static Vinyl 7"
]);

const MAX_QTY_PER_LINE = 10;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set");
    return res.status(500).json({ error: "Checkout is not configured" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];

    const line_items = items
      .filter((i) => i && ALLOWED_PRICE_IDS.has(i.price))
      .map((i) => ({
        price: i.price,
        quantity: Math.max(1, Math.min(MAX_QTY_PER_LINE, parseInt(i.quantity, 10) || 1))
      }));

    if (line_items.length === 0) {
      return res.status(400).json({ error: "Your bag is empty or contains invalid items" });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return res.status(500).json({ error: "Unable to start checkout — please try again" });
  }
};
