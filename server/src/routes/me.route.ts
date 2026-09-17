/**
 * Node modules
 */
import express from "express";
/**
 * Controllers
 */
import { getMe } from "../controller/me.controller.js";
/**
 * Types
 */
import type { Router } from "express";

const router: Router = express.Router();

router.get("/me", getMe);

export default router;
