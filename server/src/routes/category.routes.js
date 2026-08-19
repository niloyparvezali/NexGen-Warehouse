import { Router } from "express";

import {
  getCategories,
  getCategory,
  createNewCategory,
  updateExistingCategory,
  removeCategory,
  restoreExistingCategory,
} from "../controllers/category.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", getCategories);

router.get("/:id", getCategory);

router.post("/", authorize("Administrator"), createNewCategory);

router.put("/:id", authorize("Administrator"), updateExistingCategory);

router.delete("/:id", authorize("Administrator"), removeCategory);

router.patch(
  "/:id/restore",
  authorize("Administrator"),
  restoreExistingCategory,
);
export default router;
