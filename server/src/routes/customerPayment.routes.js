import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";

import {
  createPayment,
  getPayments,
  getDueSummary,
} from "../controllers/customerPayment.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createPayment);

router.get("/", getPayments);

router.get("/customer/:customerId/due", getDueSummary);

export default router;
