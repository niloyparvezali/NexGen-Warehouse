import fs from "fs";
import path from "path";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { Router } from "express";

import ApiError from "../utils/ApiError.js";
import {
  getPurchases,
  getPurchase,
  createNewPurchase,
  updateExistingPurchase,
  removePurchase,
  restoreExistingPurchase,
  changePurchaseStatus,
} from "../controllers/purchase.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const allowedFileSize = 10 * 1024 * 1024; // 10 MB

const generateUploadFilename = (fieldname, ext) => `${Date.now()}-${fieldname}.${ext}`;

const saveAttachmentFile = async (file) => {
  const fileType = await fileTypeFromBuffer(file.buffer);

  if (!fileType || !allowedMimeTypes.has(fileType.mime.toLowerCase())) {
    throw new ApiError(
      400,
      "Unsupported file: This file format is not supported. Please upload PDF, JPG, JPEG, PNG, WEBP, HEIC, or HEIF.",
    );
  }

  const filename = generateUploadFilename(file.fieldname, fileType.ext);
  const destinationPath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(destinationPath, file.buffer);

  file.filename = filename;
  file.mimetype = fileType.mime;
  return `/uploads/${filename}`;
};

const upload = multer({ storage, limits: { fileSize: allowedFileSize } });

const validateAndSaveAttachment = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    req.file.path = await saveAttachmentFile(req.file);
    req.file.filename = req.file.filename ?? path.basename(req.file.path);
    next();
  } catch (err) {
    next(err);
  }
};

// All purchase routes require authentication
router.use(authenticate);

// All authenticated users
router.get("/", getPurchases);
router.get("/:id", getPurchase);

// Administrator only
router.post(
  "/",
  authorize("Administrator"),
  upload.single("attachment"),
  validateAndSaveAttachment,
  createNewPurchase,
);

router.put(
  "/:id",
  authorize("Administrator"),
  upload.single("attachment"),
  validateAndSaveAttachment,
  updateExistingPurchase,
);

router.delete("/:id", authorize("Administrator"), removePurchase);

router.patch("/:id/restore", authorize("Administrator"), restoreExistingPurchase);

router.patch("/:id/status", authorize("Administrator"), changePurchaseStatus);

export default router;
