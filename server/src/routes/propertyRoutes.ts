import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware";
import { getLeases } from "../controllers/leaseControllers";
import { deleteProperty } from "../controllers/propertyControllers";


// ✅ Cấu hình multer để lưu ảnh lên ổ đĩa local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/")); // thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // tên file không trùng
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// ✅ Các route
router.get("/", getProperties);
router.get("/:id", getProperty);
router.get("/:id/leases", authMiddleware(["manager", "tenant"]), getLeases);

router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"), // upload nhiều ảnh
  createProperty
);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);


export default router;
