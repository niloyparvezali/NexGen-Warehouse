import { Router } from "express";

import {
  getSuppliers,
  getSupplier,
  createNewSupplier,
  updateExistingSupplier,
  removeSupplier,
  restoreExistingSupplier,
} from "../controllers/supplier.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// All supplier routes require authentication
router.use(authenticate);

// Authenticated users
router.get("/", getSuppliers);
router.get("/:id", getSupplier);

// Administrator only
router.post("/", authorize("Administrator"), createNewSupplier);

router.put("/:id", authorize("Administrator"), updateExistingSupplier);

router.delete("/:id", authorize("Administrator"), removeSupplier);

router.patch(
  "/:id/restore",
  authorize("Administrator"),
  restoreExistingSupplier,
);

export default router;
