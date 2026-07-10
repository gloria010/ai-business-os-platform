import express from "express";
import db from "./db.js";

const router = express.Router();

// Register API
router.post("/register", (req, res) => {

    console.log("Received:", req.body);

    const { name, email, phone, company, password, role } = req.body;

    const sql = `
    INSERT INTO users
    (name,email,phone,company,password,role)
    VALUES(?,?,?,?,?,?)
    `;

    db.query(
        sql,
        [name, email, phone, company, password, role],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "User registered successfully",
                id: result.insertId
            });

        }
    );

});

export default router;