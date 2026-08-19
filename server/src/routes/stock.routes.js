import { Router } from "express";

import {
  addStock,
  removeStock,
  adjustProductStock,
  getTransactions,
} from "../controllers/stock.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// All stock routes require authentication
router.use(authenticate);

// Transaction history (all authenticated users)
router.get("/transactions", getTransactions);

// Administrator only
router.post("/in", authorize("Administrator"), addStock);

router.post("/out", authorize("Administrator"), removeStock);

router.post("/adjust", authorize("Administrator"), adjustProductStock);

export default router;
