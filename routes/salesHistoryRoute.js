import express from "express";
import { getSalesHistory } from "../controllers/salesHistoryController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/sales-history", verifyToken, getSalesHistory);

export default router;
