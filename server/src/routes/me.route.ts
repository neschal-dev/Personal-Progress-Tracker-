/**
 * Node modules
 */
import express from "express";
/**
 * Controllers
 */
import { getMe } from "../controller/me.controller.js";
/**
 * Middlewares
 */
import { requireAuth } from "../middlewares/auth.middleware.js";
/**
 * Types
 */
import type { Router } from "express";

const router: Router = express.Router();

router.get("/me", requireAuth, getMe);

export default router;
