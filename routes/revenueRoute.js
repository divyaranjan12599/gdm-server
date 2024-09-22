import express from "express";
import { testing } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/test", testing);

export default router;