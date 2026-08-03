import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    console.log("=== LOGIN REQUEST RECEIVED ===");
    console.log("Request body:", req.body);

    const { email, password } = req.body;

    console.log("Email received:", email);
    console.log("Password received:", password);

    if (!email || !password) {
        console.log("Missing email or password -> returning 400");
        return res.status(400).json({
            success: false,
            message: "Email and password required"
        });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [results] = await pool.query(sql, [email]);

        console.log("DB results:", results);

        if (results.length === 0) {
            console.log("No user found with that email -> returning 401");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = results[0];

        console.log("Password from form :", password);
        console.log("Password from DB   :", user.password);
        console.log("Do they match?     :", password === user.password);

        if (password !== user.password) {
            console.log("Password mismatch -> returning 401");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Resolve the business_id this user belongs to, so every downstream
        // route (inventory, hr, sales, etc.) can look up the right
        // per-department database off the session instead of trusting a
        // client-supplied ?company= or ?business_id= query param.
        let businessId = null;

        if (user.role === "business_owner") {
            const [ownerRows] = await pool.query(
                "SELECT business_id FROM business_owners WHERE user_id = ?",
                [user.id]
            );
            if (ownerRows.length > 0) {
                businessId = ownerRows[0].business_id;
            } else {
                console.warn(
                    `[Login] business_owner user_id=${user.id} has no matching business_owners row`
                );
            }
        }

        if (user.role === "employee") {
            const [empRows] = await pool.query(
                `SELECT bo.business_id
                 FROM employees e
                 JOIN business_owners bo ON bo.id = e.business_owner_id
                 WHERE e.user_id = ?`,
                [user.id]
            );
            if (empRows.length > 0) {
                businessId = empRows[0].business_id;
            } else {
                console.warn(
                    `[Login] employee user_id=${user.id} has no matching employees/business_owners row`
                );
            }
        }

        console.log("Resolved business_id for session:", businessId);

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: businessId, // the business_id, e.g. "BIZ-FUR-HOME" - used by
                                  // downstream routes (see routes/inventory.js
                                  // companyDb middleware) to resolve the correct
                                  // per-company database. Kept as "company" to
                                  // match existing route/middleware naming.
        };

        console.log("Login successful for:", user.email);

        res.json({
            success: true,
            message: "Login successful",
            user: req.session.user
        });
    } catch (err) {
        console.error("DB error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/session", (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false, message: "Not logged in" });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Could not log out" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out" });
    });
});

export default router;