import { user, userLogin } from "../controller/user";
import express, { Router } from "express";
const router: Router = express.Router();

router.post("/signup", user);
router.post("/signin", userLogin);

export default router;
