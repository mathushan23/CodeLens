export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    error: "Not authenticated. Sign in with GitHub and try again.",
    code: "NOT_AUTHENTICATED",
  });
};
