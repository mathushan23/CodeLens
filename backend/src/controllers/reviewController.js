import { Octokit } from "@octokit/rest";

export const createOctokit = (token = process.env.GITHUB_TOKEN) => {
  return new Octokit({ auth: token });
};

export const parsePrUrl = (url) => {
  const match = url.match(/github\.com\/(.+?)\/(.+?)\/(pull|pulls)\/(\d+)/i);
  if (!match) {
    throw new Error("Invalid GitHub PR URL");
  }

  return {
    owner: match[1],
    repo: match[2],
    prNumber: Number.parseInt(match[4], 10),
  };
};

export const analyzeReview = (req, res) => {
  res.status(501).json({ error: "Analyze endpoint not implemented yet", code: "NOT_IMPLEMENTED" });
};

export const getReview = (req, res) => {
  res.status(501).json({ error: "Get review endpoint not implemented yet", code: "NOT_IMPLEMENTED" });
};

export const streamReview = (req, res) => {
  res.status(501).json({ error: "Stream endpoint not implemented yet", code: "NOT_IMPLEMENTED" });
};

export const exportReview = (req, res) => {
  res.status(501).json({ error: "Export endpoint not implemented yet", code: "NOT_IMPLEMENTED" });
};

export const postReviewToPr = (req, res) => {
  res.status(501).json({ error: "Post to PR endpoint not implemented yet", code: "NOT_IMPLEMENTED" });
};
