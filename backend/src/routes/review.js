import express from "express";
import {
  analyzeReview,
  exportReview,
  getReview,
  postReviewToPr,
  streamReview,
} from "../controllers/reviewController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(ensureAuthenticated);

router.post("/analyze", analyzeReview);
router.get("/:id", getReview);
router.get("/:id/stream", streamReview);
router.post("/:id/export", exportReview);
router.post("/:id/post-to-pr", postReviewToPr);

export default router;
