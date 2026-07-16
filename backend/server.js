import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import companiesRoute from "./routes/companies.js"; // new
import { initSchema } from "./db.js"; // <-- adjust path to wherever your schema file actually lives
import adminRoute from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "change_this_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));

app.use("/api", registerRoute);
app.use("/api", loginRoute);
app.use("/api", companiesRoute); 
app.use("/api", adminRoute);

app.get("/", (req, res) => {
    res.send("Backend server is working");
});

// Initialize DB schema before accepting requests
initSchema()
    .then(() => {
        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((err) => {
        console.error("Failed to initialize database schema:", err);
        process.exit(1);
    });