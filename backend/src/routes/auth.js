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

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const getServerBaseUrl = (req) => {
  if (process.env.SERVER_URL) {
    return trimTrailingSlash(process.env.SERVER_URL);
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const protocol = `${forwardedProto || req.protocol || "http"}`.split(",")[0].trim();
  const host = `${forwardedHost || req.get("host") || `localhost:${process.env.PORT || 5000}`}`
    .split(",")[0]
    .trim();

  return `${protocol}://${host}`;
};

const getGithubAuthOptions = (req, overrides = {}) => ({
  scope: ["user:email"],
  session: false,
  callbackURL: `${getServerBaseUrl(req)}/auth/github/callback`,
  ...overrides,
});

const requireGithubAuth = (req, res, next) => {
  if (githubAuthEnabled) {
    return next();
  }

  return res.status(503).json({
    error: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in the root .env file.",
    code: "GITHUB_AUTH_NOT_CONFIGURED",
  });
};

router.get("/github", requireGithubAuth, (req, res, next) =>
  passport.authenticate("github", getGithubAuthOptions(req))(req, res, next),
);

router.get(
  "/github/callback",
  requireGithubAuth,
  (req, res, next) =>
    passport.authenticate(
      "github",
      getGithubAuthOptions(req, { failureRedirect: "/auth/github/failure" }),
    )(req, res, next),
  githubAuthCallback,
);

router.get("/github/failure", githubAuthFailure);

router.get("/me", attachAuthenticatedUser, getCurrentUser);
router.post("/logout", logoutUser);
router.get("/logout", logoutUser);

export default router;
