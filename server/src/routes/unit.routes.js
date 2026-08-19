import { Router } from "express";

import {
  getUnits,
  getUnit,
  createNewUnit,
  updateExistingUnit,
  removeUnit,
  restoreExistingUnit,
} from "../controllers/unit.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Authenticated users
router.get("/", getUnits);
router.get("/:id", getUnit);

// Administrator only
router.post("/", authorize("Administrator"), createNewUnit);

router.put("/:id", authorize("Administrator"), updateExistingUnit);

router.patch("/:id/restore", authorize("Administrator"), restoreExistingUnit);

router.delete("/:id", authorize("Administrator"), removeUnit);

export default router;
