import express from "express";
import {
  createProduct,
  getAllProductsNonFood,
  updateProduct,
  deleteProduct,
  getDetailProduct,
  getMyProducts,
  getAllProductsFood,
  toggleToko,
  approveWithdraw,
  rejectWithdraw,
  requestWithdraw,
  getAllSaldo,
  getMySaldo,
  getAllWithdraw,
  getIsOpen,
  getProductsByUmkm,
} from "../controllers/productController.js";
import {
  verifyToken,
  verifyAdmin,
  verifyUmkm,
} from "../middleware/verifyToken.js";
import { uploadProductImages } from "../middleware/upload.js";

const router = express.Router();

// public
router.get("/get/nonfood", getAllProductsNonFood);
router.get("/get/umkm/produk/:umkmId", getProductsByUmkm);

router.patch(
  "/toggle/status",
  verifyToken,
  verifyUmkm,

  toggleToko,
);
router.get("/get/isopen", verifyToken, verifyUmkm, getIsOpen);

router.get("/get/food", getAllProductsFood);

router.get("/get/all-withdraw/umkm", verifyToken, verifyAdmin, getAllWithdraw);
router.post("/request/withdraw", verifyToken, verifyUmkm, requestWithdraw);
router.post("/approve/withdraw/:id", verifyToken, verifyAdmin, approveWithdraw);
router.post("/reject/withdraw/:id", verifyToken, verifyAdmin, rejectWithdraw);
router.get("/get/saldo", verifyToken, verifyUmkm, getMySaldo);
router.get("/get/all-saldo", verifyToken, verifyAdmin, getAllSaldo);

// UMKM only
router.get("/myproduk", verifyToken, verifyUmkm, getMyProducts);
// UMKM only
router.post(
  "/add",
  verifyToken,
  verifyUmkm,
  uploadProductImages,
  createProduct,
);

router.get("/detail/:id", getDetailProduct);

router.put(
  "/update/:id",
  verifyToken,
  verifyUmkm,
  uploadProductImages, // ⬅️ WAJIB
  updateProduct,
);

// UMKM (produk sendiri) & ADMIN
router.delete("/delete/:id", verifyToken, deleteProduct);

export default router;
