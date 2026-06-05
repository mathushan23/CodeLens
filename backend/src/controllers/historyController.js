import { findReviewsByUserId } from "../models/reviewModel.js";

export const getReviewHistory = async (req, res) => {
  try {
    const history = await findReviewsByUserId(req.user.id);

    res.json(
      history.map((review) => ({
        id: review.id,
        createdAt: review.createdAt,
        repoName: review.repoName,
        prTitle: review.prTitle,
        prUrl: review.prUrl,
        prNumber: review.prNumber,
        score: review.score,
        status: review.status?.toLowerCase?.() || review.status,
        severity: review.severity,
        issues: Number(review.issueCount ?? 0),
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to load review history", code: "HISTORY_FETCH_FAILED" });
  }
};
