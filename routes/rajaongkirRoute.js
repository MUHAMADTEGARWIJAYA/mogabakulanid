import express from "express";
import {
  syncProvinces,
  syncCities,
  syncDistrictsByCity,
} from "../controllers/locationController.js";

const router = express.Router();

router.get("/sync/provinces", syncProvinces);
router.get("/sync/cities", syncCities);
router.get("/districts", syncDistrictsByCity);
export default router;
