import express from "express";
import {
  checkout,
  getOrdersUser,
  confirmOrderByBuyer,
  confirmOrderBySeller,
  getIncomingOrdersFoodUmkm,
  getOrderHistoryUmkm,
  getIncomingOrdersNonFoodUmkm,
  getDetailOrderUser,
  inputResi,
  cancelOrderByBuyer,
  cancelOrderBySeller,
} from "../controllers/orderController.js";
import { verifyToken, verifyUmkm } from "../middleware/verifyToken.js";
import { hitungOngkirFood } from "../config/ongkirService.js";
const router = express.Router();

/**
 * USER
 */

// checkout + generate midtrans snap token
router.post("/checkout", verifyToken, checkout);
router.post("/ongkir", verifyToken, hitungOngkirFood);

router.post("/orders/:id/cancel/buyer", verifyToken, cancelOrderByBuyer);
router.post(
  "/orders/:id/cancel/seller",
  verifyToken,
  verifyUmkm,
  cancelOrderBySeller,
);

// input resi
router.post("/orders/:orderId/input-resi", verifyToken, inputResi);

// detail order user
router.get("/orders/:id", verifyToken, getDetailOrderUser);

router.get(
  "/incoming-orders/food",
  verifyToken,
  verifyUmkm,
  getIncomingOrdersFoodUmkm,
);

router.get(
  "/incoming-orders/non-food",
  verifyToken,
  verifyUmkm,
  getIncomingOrdersNonFoodUmkm,
);

router.get("/order-history", verifyToken, verifyUmkm, getOrderHistoryUmkm);

// konfirmasi order oleh pembeli
router.post("/orders/:id/confirm/buyer", verifyToken, confirmOrderByBuyer);

// konfirmasi order oleh penjual
router.post(
  "/orders/:id/confirm/seller",
  verifyToken,
  verifyUmkm,
  confirmOrderBySeller,
);

// batalkan order oleh pembeli

//
router.get("/user", verifyToken, getOrdersUser);

// ambil semua order milik user
// router.get("/my-orders", verifyToken, getUserOrders);

// // detail order user
// router.get("/my-orders/:id", verifyToken, getOrderDetail);

export default router;
