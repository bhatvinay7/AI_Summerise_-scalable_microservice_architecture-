import upload from "../Multer/multer";
import express, { Router } from "express";
import uploadFile from "../controller/uploadFile";
const router: Router = express.Router();
router.post("/upload", upload.array("file"), uploadFile);

export default router;
