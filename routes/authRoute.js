import express from "express";
import {
  registerUser,
  registerUmkm,
  registerAdmin,
  loginUser,
  loginUmkm,
  loginAdmin,
  getAllUmkm,
  rejectUmkm,
  login,
  getMyProfile,
  
} from "../controllers/authController.js";
import { approveUmkm } from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// ================= REGISTER =================
router.post("/register/user", registerUser);
router.post("/register/umkm", registerUmkm);
router.post("/register/admin", registerAdmin);
router.post("/login", login);

// ================= GET MY PROFILE =================
router.get("/profile", verifyToken, getMyProfile);

// ================= LOGIN =================
router.post("/login/user", loginUser);
router.post("/login/umkm", loginUmkm);
router.post("/login/admin", loginAdmin);

//================= EXPORT ROUTER =================
router.get("/getall", verifyToken, verifyAdmin, getAllUmkm);
router.put("/approve/:id", verifyToken, verifyAdmin, approveUmkm);
router.put("/reject/:id", verifyToken, verifyAdmin, rejectUmkm);

export default router;
