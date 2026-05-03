import express from "express";
import {
  addToCart,
  getCartUser,
  updateCartItem,
  deleteCartItem,
} from "../controllers/CartController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/user", verifyToken, getCartUser);
router.put("/cart", verifyToken, updateCartItem);
router.delete("/cart/:cart_item_id", verifyToken, deleteCartItem);

export default router;
