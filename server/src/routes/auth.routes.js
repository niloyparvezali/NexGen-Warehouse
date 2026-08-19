import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

const router = Router();
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route is working",
  });
});

console.log("✅ Auth routes loaded");

router.post("/login", login);

export default router;
