import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";

//business
import businessRoute from "./routes/business.js";
import companiesRoute from "./routes/companies.js"; // new
import { initSchema } from "./db.js"; // <-- adjust path to wherever your schema file actually lives
import adminRoute from "./routes/admin.js";
import subscribeRoutes from "./routes/subscribe.js";
import inventoryRouter from "./routes/inventory.js";
import messagesRouter from "./routes/messages.js";
import hrRouter from "./routes/hr.js";
import employeeRouter from "./routes/employee.js";
import salesRouter from "./routes/sales.js";
import ceoRouter from "./routes/ceo.js";
import path from "path";
import { fileURLToPath } from "url";
import advertisementRouter from "./routes/advertisement.js";
import ceoaiRouter from "./routes/ceoai.js";



// users
import userProductsRouter from "./routes/user/products.js";
import userWishlistRouter from "./routes/user/wishlist.js";
import cartRoutes from './routes/user/cartRoutes.js';
import feedbackRoutes from './routes/user/feedback.js';
import contactRoutes from './routes/user/contact.js';
import userOrdersRoutes from "./routes/user/orders.js";
import checkoutRoutes from "./routes/user/checkout.js";
import categoriesRouter from "./routes/user/categories.js";
import userDashboardRouter from "./routes/user/userdashboard.js";
import forgotPasswordRoutes from "./routes/user/forgotPassword.js";
import searchRouter from "./routes/user/search.js"; 
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true
}));

app.use(express.json({ limit: "25mb" }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", registerRoute);
app.use("/api", loginRoute);

//business
app.use("/api", companiesRoute); 
app.use("/api", businessRoute);
app.use("/api", adminRoute);
app.use("/api", subscribeRoutes);
app.use("/api/inventory", inventoryRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/hr", hrRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/sales", salesRouter);
app.use("/api/ceo", ceoRouter);
app.use("/api", advertisementRouter);
app.use("/api/ceoai", ceoaiRouter);

//users
app.use("/api/user", userProductsRouter);
app.use("/api/user", userWishlistRouter);
app.use('/api/user', cartRoutes);
app.use('/api/user', feedbackRoutes);
app.use('/api/user', contactRoutes);
app.use("/api/user/orders", userOrdersRoutes);
app.use("/api/user/checkout", checkoutRoutes);
app.use("/api/user/categories", categoriesRouter);
app.use("/api/user", forgotPasswordRoutes);
app.use("/api/user", userDashboardRouter);
app.use("/api/user", searchRouter);  

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