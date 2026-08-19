import { Router } from "express";

import {
  getBrands,
  getBrand,
  createNewBrand,
  updateExistingBrand,
  removeBrand,
  restoreExistingBrand,
} from "../controllers/brand.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// All brand routes require authentication
router.use(authenticate);

// Public to authenticated users
router.get("/", getBrands);
router.get("/:id", getBrand);

// Administrator only
router.post("/", authorize("Administrator"), createNewBrand);

router.put("/:id", authorize("Administrator"), updateExistingBrand);

router.patch("/:id/restore", authorize("Administrator"), restoreExistingBrand);

router.delete("/:id", authorize("Administrator"), removeBrand);

export default router;
