import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const uploadProductImages = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).array("images", 5); // max 5 images
