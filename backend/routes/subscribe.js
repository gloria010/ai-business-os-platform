import express from "express";
import pool from "../db.js";

const router = express.Router();

const PLAN_PRICES = {
  starter: 499,
  professional: 999,
  enterprise: 2499,
};

const PROMO_CODES = {
  WELCOME10: { type: "percent", value: 10 },
  AIBIZ20: { type: "percent", value: 20 },
  STARTUP50: { type: "flat", value: 50 },
};

// Referral discount depends on the REFERRING business's own plan (not the
// new subscriber's plan). Starter isn't listed here on purpose -> a
// business on the Starter plan doesn't give referral discounts.
const REFERRAL_DISCOUNT_BY_PLAN = {
  professional: 5,
  enterprise: 10,
};

// Generates a referral pincode like "REF-7K9QX2" for a newly subscribed business.
// Not guaranteed globally unique without a DB check/retry loop — add a UNIQUE
// constraint on business_owners.pincode and retry on collision if that matters here.
function generateReferralPincode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return "REF-" + code;
}

// Shared logic for both /validate-promo (preview) and /subscribe (real charge).
// Returns { discount, referredByBusinessId, valid, reason }.
async function resolvePromoDiscount(conn, promo, basePrice, currentBusinessId) {
  if (!promo) {
    return { discount: 0, referredByBusinessId: null, valid: true, reason: null };
  }

  const promoTrimmed = promo.trim();
  const promoUpper = promoTrimmed.toUpperCase();

  if (PROMO_CODES[promoUpper]) {
    const code = PROMO_CODES[promoUpper];
    const discount = code.type === "percent"
      ? Math.round(basePrice * (code.value / 100))
      : code.value;
    return { discount, referredByBusinessId: null, valid: true, reason: null };
  }

  // Check if it matches another business's referral pincode.
  // The discount % depends on the REFERRING business's own plan.
  const [referralRows] = await conn.query(
    "SELECT business_id, pincode, subscription FROM business_owners WHERE pincode = ? LIMIT 1",
    [promoTrimmed]
  );

  if (referralRows.length === 0) {
    return { discount: 0, referredByBusinessId: null, valid: false, reason: "Invalid promo code" };
  }

  if (referralRows[0].business_id === currentBusinessId) {
    return { discount: 0, referredByBusinessId: null, valid: false, reason: "You can't use your own referral code" };
  }

  const referrer = referralRows[0];
  const referrerPlan =
    typeof referrer.subscription === "string" ? referrer.subscription.trim().toLowerCase() : "";
  const referralPercent = REFERRAL_DISCOUNT_BY_PLAN[referrerPlan];

  if (!referralPercent) {
    return {
      discount: 0,
      referredByBusinessId: null,
      valid: false,
      reason: "This referral code doesn't currently offer a discount",
    };
  }

  return {
    discount: Math.round(basePrice * (referralPercent / 100)),
    referredByBusinessId: referrer.business_id,
    valid: true,
    reason: null,
  };
}

// POST /api/validate-promo
// Body: { plan, promo }
// Preview-only: tells the frontend what discount a code WOULD give, without
// charging anything. /subscribe re-validates independently — this is just
// so the checkout page can show the real number before payment.
router.post("/validate-promo", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const userId = req.session.user.id;
  const { plan, promo } = req.body;

  const normalizedPlan = typeof plan === "string" ? plan.trim().toLowerCase() : "";
  const basePrice = PLAN_PRICES[normalizedPlan];

  if (!basePrice) {
    return res.status(400).json({ success: false, message: "Invalid plan" });
  }

  const conn = await pool.getConnection();

  try {
    const [bizRows] = await conn.query(
      "SELECT business_id FROM business_owners WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (bizRows.length === 0) {
      return res.status(404).json({ success: false, message: "Business profile not found" });
    }

    const { discount, valid, reason } = await resolvePromoDiscount(
      conn,
      promo,
      basePrice,
      bizRows[0].business_id
    );

    if (!valid) {
      return res.json({ success: false, message: reason });
    }

    const subtotal = basePrice - discount;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    return res.json({ success: true, discount, gst, total });
  } catch (err) {
    console.error("Validate promo error:", err);
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

router.post("/subscribe", async (req, res) => {
  console.log("=== SUBSCRIBE REQUEST RECEIVED ===");
  console.log("Request body:", req.body);
  console.log("Session user:", req.session.user);

  if (!req.session.user) {
    console.log("No session -> returning 401");
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const userId = req.session.user.id;
  const { plan, promo, paymentMethod } = req.body;

  console.log("User ID:", userId);
  console.log("Plan (raw):", plan);
  console.log("Promo:", promo);
  console.log("Payment method:", paymentMethod);

  // Normalize plan name so "Starter", "starter", "STARTER" all match
  const normalizedPlan = typeof plan === "string" ? plan.trim().toLowerCase() : "";
  const basePrice = PLAN_PRICES[normalizedPlan];

  if (!basePrice) {
    console.log("Invalid plan -> returning 400. Normalized plan was:", normalizedPlan);
    return res.status(400).json({ success: false, message: "Invalid plan" });
  }

  // Canonical display name (Starter / Professional / Enterprise) for storage
  const planDisplayName =
    normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [bizRows] = await conn.query(
      "SELECT * FROM business_owners WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    console.log("Business row found:", bizRows);

    if (bizRows.length === 0) {
      console.log("No business profile -> returning 404");
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Business profile not found" });
    }

    const business = bizRows[0];

    if (business.subscription) {
      console.log("Already subscribed -> returning 409");
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "This business already has an active subscription",
      });
    }

    const { discount, referredByBusinessId } = await resolvePromoDiscount(
      conn,
      promo,
      basePrice,
      business.business_id
    );

    if (promo) {
      console.log("Promo resolved. Discount:", discount, "Referred by:", referredByBusinessId);
    }

    const subtotal = basePrice - discount;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    console.log("Base price:", basePrice);
    console.log("Discount:", discount);
    console.log("GST:", gst);
    console.log("Total:", total);

    const payid = "PAY-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
    console.log("Generated payid:", payid);

    const [paymentResult] = await conn.query(
      `INSERT INTO payments
        (user_id, business_id, company, pincode, payid, subscription, amount, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid')`,
      [
        userId,
        business.business_id,
        business.company,
        business.pincode,
        payid,
        planDisplayName,
        total,
        paymentMethod,
      ]
    );

    const paymentId = paymentResult.insertId;
    console.log("Payment inserted, ID:", paymentId);

    const subscriptionDate = new Date().toISOString().slice(0, 10);
    console.log("Subscription date:", subscriptionDate);

    // Give this business its own referral pincode if it doesn't already have one,
    // so other businesses can use it at checkout for a discount.
    const referralPincode = business.pincode || generateReferralPincode();
    console.log("Referral pincode for this business:", referralPincode);

    await conn.query(
      `UPDATE business_owners
       SET subscription = ?, subscription_date = ?, payment_id = ?, pincode = ?
       WHERE business_id = ?`,
      [planDisplayName, subscriptionDate, paymentId, referralPincode, business.business_id]
    );

    console.log("business_owners updated for business_id:", business.business_id);

    await conn.commit();

    console.log("Transaction committed successfully");

    res.json({
      success: true,
      message: "Subscription activated",
      subscriptionId: payid,
      plan: planDisplayName,
      total,
      subscriptionDate,
      referralPincode,
      referredByBusinessId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Subscribe error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

export default router;