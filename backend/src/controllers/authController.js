import { getAuthCookieOptions, signJwt } from "../middleware/jwt.js";

function toUserResponse(user) {
  const { id, githubId, username, email, avatarUrl, createdAt } = user;
  return { id, githubId, username, email, avatarUrl, createdAt };
}

export const githubAuthFailure = (req, res) => {
  res.status(401).json({ error: "GitHub authentication failed", code: "AUTH_FAILURE" });
};

export const githubAuthCallback = (req, res) => {
  const token = signJwt({
    sub: req.user.id,
    githubId: req.user.githubId,
    username: req.user.username,
  });

  res.cookie("auth_token", token, getAuthCookieOptions());
  res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated", code: "NOT_AUTHENTICATED" });
  }

  return res.json(toUserResponse(req.user));
};

export const logoutUser = (req, res) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie("auth_token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });
  return res.json({ success: true });
};
