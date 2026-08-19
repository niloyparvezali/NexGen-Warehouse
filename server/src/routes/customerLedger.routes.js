import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { getLedger } from "../controllers/customerLedger.controller.js";

const router = Router();

router.use(authenticate);

router.get("/:customerId", getLedger);

export default router;
