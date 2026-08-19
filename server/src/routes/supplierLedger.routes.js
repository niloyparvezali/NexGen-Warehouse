import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { getLedger } from "../controllers/supplierLedger.controller.js";

const router = Router();

router.use(authenticate);

router.get("/:supplierId", getLedger);

export default router;
