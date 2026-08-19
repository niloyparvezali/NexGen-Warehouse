import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getCustomers,
  getCustomer,
  createNewCustomer,
  updateExistingCustomer,
  removeCustomer,
  restoreExistingCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getCustomers);
router.get("/:id", getCustomer);

router.post("/", authorize("Administrator", "Manager"), createNewCustomer);

router.put("/:id", authorize("Administrator", "Manager"), updateExistingCustomer);

router.delete("/:id", authorize("Administrator"), removeCustomer);

router.patch("/:id/restore", authorize("Administrator"), restoreExistingCustomer);

export default router;
