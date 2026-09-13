/**
 * Node module
 */

import { Router } from "express";
/**
 * Routers
 */
import { googleAuth } from "../controller/auth.controller.js";

const router: Router = Router();

router.get("/google", googleAuth);
export default router;
