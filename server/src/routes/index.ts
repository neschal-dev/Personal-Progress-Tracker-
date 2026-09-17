/**
 *Node Modules
 */
import express from "express";
/**
 * Types
 */
import type { Router } from "express";

/**
 * Routers
 */
import authRoutes from "./auth.routes.js";
import meRoutes from "./me.route.js";

const router: Router = express.Router();

/**
 * Routes
 */
router.use("/auth", authRoutes);
router.use("/", meRoutes);

export default router;
