const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ paid: false, error: "Missing session_id" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.status(200).json({ paid: session.payment_status === "paid" });
  } catch (err) {
    res.status(400).json({ paid: false, error: err.message });
  }
};
