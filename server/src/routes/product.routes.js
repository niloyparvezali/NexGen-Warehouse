import { Router } from "express";

import {
  getProducts,
  getProduct,
  createNewProduct,
  updateExistingProduct,
  removeProduct,
  restoreExistingProduct,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// All product routes require authentication
router.use(authenticate);

// Authenticated users
router.get("/", getProducts);
router.get("/:id", getProduct);

// Administrator only
router.post("/", authorize("Administrator"), createNewProduct);

router.put("/:id", authorize("Administrator"), updateExistingProduct);

router.delete("/:id", authorize("Administrator"), removeProduct);

router.patch(
  "/:id/restore",
  authorize("Administrator"),
  restoreExistingProduct,
);

export default router;
