import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";

import {
  createPayment,
  getPayments,
  getDueSummary,
} from "../controllers/supplierPayment.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createPayment);

router.get("/", getPayments);

router.get("/supplier/:supplierId/due", getDueSummary);

export default router;
