import express from "express";
import { getReviewHistory } from "../controllers/historyController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getReviewHistory);

export default router;
