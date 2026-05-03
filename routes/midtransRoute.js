import express from "express";
import {
  midtransNotification,
  getDetailOrderUmkm,
} from "../controllers/midtransController.js";
import { verifyToken, verifyUmkm } from "../middleware/verifyToken.js";

const router = express.Router();

// webhook TIDAK pakai auth
router.post("/notification", midtransNotification);
router.get("/orders/:id", verifyToken, verifyUmkm, getDetailOrderUmkm);

export default router;
