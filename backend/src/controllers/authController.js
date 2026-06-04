export const githubAuthFailure = (req, res) => {
  res.status(401).json({ error: "GitHub authentication failed", code: "AUTH_FAILURE" });
};

export const githubAuthCallback = (req, res) => {
  res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
};

export const getCurrentUser = (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated", code: "NOT_AUTHENTICATED" });
  }

  const { id, githubId, username, email, avatarUrl, createdAt } = req.user;
  return res.json({ id, githubId, username, email, avatarUrl, createdAt });
};

export const logoutUser = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    return res.json({ success: true });
  });
};
