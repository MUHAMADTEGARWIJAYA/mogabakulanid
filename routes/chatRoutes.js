import express from "express";
import {
  getChatByOrder,
  getMessages,
  sendMessage,
  markAsRead,
} from "../controllers/ChatController.js";
import { verifyToken, verifyUmkm } from "../middleware/verifyToken.js";
const router = express.Router();

router.get("/chat/order/:order_id", verifyToken, getChatByOrder);
router.get("/chat/messages/:chat_id", verifyToken, getMessages);
router.post("/chat/send", verifyToken, sendMessage);
router.patch("/chat/read/:chat_id", verifyToken, verifyUmkm, markAsRead);

export default router;
