import express, { Router } from "express";
import authMiddleware from "../auth/authVerifierMiddleware";
const router: Router = express.Router();
router.post("auth",authMiddleware);
export default router;