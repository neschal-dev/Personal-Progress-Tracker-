/**
 *Node Modules
 */
import { Express, Router } from "express";
import authRoutes from "./auth.routes.js";

const router: Router = Router();

/**
 * Routes
 */

router.use("/auth", authRoutes);
export default router;
