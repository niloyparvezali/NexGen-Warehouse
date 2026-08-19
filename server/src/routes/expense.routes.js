import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  restore,
} from "../controllers/expense.controller.js";

const router = Router();

// All expense routes require authentication
router.use(authenticate);

router.get("/", getAll);
router.get("/:id", getOne);

// Administrator only for creating, updating, deleting, restoring expenses
router.post("/", authorize("Administrator"), create);
router.put("/:id", authorize("Administrator"), update);
router.delete("/:id", authorize("Administrator"), remove);
router.patch("/:id/restore", authorize("Administrator"), restore);

export default router;
