import express from "express";
import passport from "passport";
import { githubAuthEnabled } from "../middleware/passport.js";
import { attachAuthenticatedUser } from "../middleware/authMiddleware.js";
import {
  getCurrentUser,
  githubAuthCallback,
  githubAuthFailure,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

const requireGithubAuth = (req, res, next) => {
  if (githubAuthEnabled) {
    return next();
  }

  return res.status(503).json({
    error: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in the root .env file.",
    code: "GITHUB_AUTH_NOT_CONFIGURED",
  });
};

router.get("/github", requireGithubAuth, passport.authenticate("github", { scope: ["user:email"], session: false }));

router.get(
  "/github/callback",
  requireGithubAuth,
  passport.authenticate("github", { failureRedirect: "/auth/github/failure", session: false }),
  githubAuthCallback,
);

router.get("/github/failure", githubAuthFailure);

router.get("/me", attachAuthenticatedUser, getCurrentUser);
router.post("/logout", logoutUser);
router.get("/logout", logoutUser);

export default router;
