import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  createCategory,
  getCategories,
  getCategory,
  removeCategory,
  restoreCategory,
  updateCategory,
} from "../controllers/expenseCategory.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", authorize("Administrator"), createCategory);
router.put("/:id", authorize("Administrator"), updateCategory);
router.delete("/:id", authorize("Administrator"), removeCategory);
router.patch("/:id/restore", authorize("Administrator"), restoreCategory);

export default router;
