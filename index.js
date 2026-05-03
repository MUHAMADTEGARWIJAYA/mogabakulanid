import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";

import db from "./config/database.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import OrderItem from "./routes/OrderRoute.js";
import midtransRoute from "./routes/midtransRoute.js";
import SalesHistory from "./routes/salesHistoryRoute.js";
import ChatRoute from "./routes/chatRoutes.js";
import rajaongkirRoute from "./routes/rajaongkirRoute.js";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// static folder upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// middleware
app.use(express.json());
// ================= MIDDLEWARE =================
app.use(helmet()); // security
app.use(cors()); // allow frontend access
// app.use(morgan("dev")); // log request

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================= ROUTE =================
app.use("/api/auth", authRoute);
app.use("/api/produk", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/rajaongkir", rajaongkirRoute);
app.use("/api/chats", ChatRoute);
app.use("/api/order-items", OrderItem);
app.use("/midtrans", midtransRoute);
app.use("/api/sales", SalesHistory);

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected 🚀",
  });
});

// test route
app.get("/", (req, res) => {
  res.send("API Ecommerce UMKM berjalan 🚀");
});

// cek koneksi database
(async () => {
  try {
    await db.authenticate();
    console.log("✅ Database MySQL connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
