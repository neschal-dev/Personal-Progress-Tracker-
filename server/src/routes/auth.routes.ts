/**
 * Node module
 */
import express from "express";
/**
 * Routers
 */
import type { Router } from "express";

/**
 * Controllers
 */
import {
  googleAuth,
  googleCallback,
  refresh,
  logout,
} from "../controller/auth.controller.js";

const router: Router = express.Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
