import express from "express";
import pool from "../db.js"; // main pool - holds `orders` and `business_owners` tables

const router = express.Router();

// Same session-based scoping used across ceo.js, hr.js, messages.js.
async function getBusinessId(req) {
  const sessionUser = req.session?.user;
  return sessionUser?.company || req.session?.workspace || req.session?.businessId || null;
}

router.get("/analytics/forecast", async (req, res) => {
  // Prevent any caching — this response is session-scoped (per business),
  // but the URL is identical for every business, so without this header
  // browsers/proxies can serve a stale response from a DIFFERENT company's
  // session to the current user.
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");

  try {
    const businessId = await getBusinessId(req);

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Business not identified" });
    }

    const monthsBack = Math.min(Math.max(parseInt(req.query.months) || 6, 3), 24);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
    const startLabel = startDate.toISOString().slice(0, 10);

    // ---- Step 1: this business's trailing monthly sales ----
    const [ownRows] = await pool.query(
      `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(total) AS sales
       FROM orders
       WHERE business_id = ? AND order_date >= ?
       GROUP BY DATE_FORMAT(order_date, '%Y-%m')
       ORDER BY month ASC`,
      [businessId, startLabel]
    );

    const monthlySeries = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = ownRows.find((r) => r.month === key);
      monthlySeries.push({ month: key, sales: Number(found?.sales || 0) });
    }

    // ---- Step 2: weighted linear regression forecast ----
    // x = month index (0..n-1), y = sales. Recent months get higher weight
    // via w_i = i+1, so the trendline leans toward recent momentum.
    const n = monthlySeries.length;
    const xs = monthlySeries.map((_, i) => i);
    const ys = monthlySeries.map((m) => m.sales);
    const weights = xs.map((i) => i + 1);

    const sumW = weights.reduce((a, b) => a + b, 0);
    const sumWX = xs.reduce((a, x, i) => a + weights[i] * x, 0);
    const sumWY = ys.reduce((a, y, i) => a + weights[i] * y, 0);
    const sumWXY = xs.reduce((a, x, i) => a + weights[i] * x * ys[i], 0);
    const sumWX2 = xs.reduce((a, x, i) => a + weights[i] * x * x, 0);

    const denom = sumW * sumWX2 - sumWX * sumWX;
    const slope = denom !== 0 ? (sumW * sumWXY - sumWX * sumWY) / denom : 0;
    const intercept = sumW !== 0 ? (sumWY - slope * sumWX) / sumW : 0;

    const forecastNextMonth = Math.max(0, Math.round(intercept + slope * n));
    const forecastMonthAfter = Math.max(0, Math.round(intercept + slope * (n + 1)));
    const trendDirection = slope > 0 ? "up" : slope < 0 ? "down" : "flat";

    const ownTotal = monthlySeries.reduce((a, m) => a + m.sales, 0);
    const averageMonthlySales = Math.round(ownTotal / monthsBack);

    // ---- Step 3: benchmark against other businesses in the same category,
    // falling back to platform-wide if fewer than 3 category peers exist.
    // Only aggregate numbers are ever returned — no other business's
    // identity, name, or raw records.
    const [categoryRows] = await pool.query(
      `SELECT business_category FROM business_owners WHERE business_id = ? LIMIT 1`,
      [businessId]
    );
    const category = categoryRows[0]?.business_category || null;

    let peerBusinessIds = [];
    let benchmarkScope = "platform";

    if (category) {
      const [peers] = await pool.query(
        `SELECT business_id FROM business_owners
         WHERE business_category = ? AND status = 'approved' AND business_id != ?`,
        [category, businessId]
      );
      peerBusinessIds = peers.map((p) => p.business_id);
      if (peerBusinessIds.length >= 3) {
        benchmarkScope = "category";
      }
    }

    // No date restriction here — compare ALL-TIME totals so every business
    // with any order history counts, not just orders within the forecast window.
    let benchRows;
    if (benchmarkScope === "category") {
      const placeholders = peerBusinessIds.map(() => "?").join(",");
      [benchRows] = await pool.query(
        `SELECT business_id, SUM(total) AS total_sales
         FROM orders
         WHERE business_id IN (${placeholders})
         GROUP BY business_id`,
        peerBusinessIds
      );
    } else {
      [benchRows] = await pool.query(
        `SELECT business_id, SUM(total) AS total_sales
         FROM orders
         WHERE business_id != ?
         GROUP BY business_id`,
        [businessId]
      );
    }

    const otherTotals = benchRows.map((r) => Number(r.total_sales || 0)).sort((a, b) => a - b);
    const industryAverage =
      otherTotals.length > 0 ? otherTotals.reduce((a, b) => a + b, 0) / otherTotals.length : 0;
    const industryMedian =
      otherTotals.length > 0
        ? otherTotals.length % 2 === 0
          ? (otherTotals[otherTotals.length / 2 - 1] + otherTotals[otherTotals.length / 2]) / 2
          : otherTotals[Math.floor(otherTotals.length / 2)]
        : 0;

    const rankBelow = otherTotals.filter((v) => v < ownTotal).length;
    const percentile = otherTotals.length > 0 ? Math.round((rankBelow / otherTotals.length) * 100) : null;

    const MIN_RELIABLE_SAMPLE = 5;
    const lowSample = otherTotals.length < MIN_RELIABLE_SAMPLE;

    return res.json({
      success: true,
      forecast: {
        monthlySeries,
        trendDirection,
        forecastNextMonth,
        forecastMonthAfter,
      },
      summary: {
        ownTotal,
        averageMonthlySales,
        monthsAnalyzed: monthsBack,
      },
      benchmark: {
        scope: benchmarkScope,
        category: category || null,
        categoryPeerCount: peerBusinessIds.length,
        industryAverage: Math.round(industryAverage),
        industryMedian: Math.round(industryMedian),
        percentile,
        comparedAgainstCount: otherTotals.length,
        lowSample,
      },
    });
  } catch (err) {
    console.error("CEOAI analytics forecast error:", err);
    return res.status(500).json({ success: false, message: "Failed to compute forecast" });
  }
});

export default router;