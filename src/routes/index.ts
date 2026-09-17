/**
 *Node Modules
 */
import { Express, Router } from "express";
import authRoutes from "./auth.routes.js";
import meRoutes from "./me.route.js";

const router: Router = Router();

/**
 * Routes
 */

router.use("/auth", authRoutes);
router.use("/", meRoutes);
export default router;
