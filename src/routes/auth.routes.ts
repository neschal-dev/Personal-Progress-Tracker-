/**
 * Node module
 */

/**
 * Routers
 */
import { Router } from "express";

/**
 * Controllers
 */
import { googleAuth, googleCallback } from "../controller/auth.controller.js";

const router: Router = Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
export default router;
