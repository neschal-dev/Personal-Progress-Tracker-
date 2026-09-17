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
import { googleAuth, googleCallback } from "../controller/auth.controller.js";

const router: Router = express.Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;
