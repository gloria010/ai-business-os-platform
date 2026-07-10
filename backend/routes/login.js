import express from "express";
import db from "./db.js";

const router = express.Router();

router.post("/login", (req, res) => {
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

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }

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

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        console.log("Login successful for:", user.email);

        res.json({
            success: true,
            message: "Login successful",
            user: req.session.user
        });
    });
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