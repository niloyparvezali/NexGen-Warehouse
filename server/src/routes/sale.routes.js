import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getSales,
  getSale,
  createNewSale,
  createSaleReturnController,
  removeSale,
  restoreExistingSale,
  updateExistingSaleStatus,
} from "../controllers/sale.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getSales);
router.post("/", authorize("Administrator", "Manager", "Cashier"), createNewSale);
router.post(
  "/:id/returns",
  authorize("Administrator", "Manager", "Cashier"),
  createSaleReturnController,
);
router.patch("/:id/restore", authorize("Administrator"), restoreExistingSale);
router.delete("/:id", authorize("Administrator"), removeSale);
router.get("/:id", getSale);

router.patch(
  "/:id/status",
  authorize("Administrator", "Manager"),
  updateExistingSaleStatus,
);

export default router;
