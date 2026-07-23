// Vercel serverless function.
// Creates a fresh $1.99 Stripe Checkout Session every time someone starts a new resume.
// The Stripe secret key lives only here, server-side — never in the browser.

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "CV4ME — one resume" },
            unit_amount: 199, // $1.99, in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/app.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app.html`,
      // Appended to the account-level statement descriptor prefix.
      // Renders as "BOSHBUILDS* CV4ME" on the customer's card statement.
      payment_intent_data: {
        statement_descriptor_suffix: "CV4ME",
      },
      // Tags the session so per-product reporting works once there's a 2nd product.
      metadata: { product: "cv4me" },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
