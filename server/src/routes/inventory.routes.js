import { Router } from "express";
import {
  listInventory,
  listInventoryMovements,
  adjustInventory,
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", listInventory);
router.get("/movements", listInventoryMovements);
router.post("/adjust", authorize("Administrator"), adjustInventory);

export default router;
