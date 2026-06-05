import { findUserById } from "../models/userModel.js";
import { extractTokenFromRequest, verifyJwt } from "./jwt.js";

async function resolveAuthenticatedUser(req) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const payload = verifyJwt(token);
  const user = await findUserById(payload.sub);
  return user || null;
}

export const attachAuthenticatedUser = async (req, res, next) => {
  try {
    const user = await resolveAuthenticatedUser(req);
    req.user = user;
    return next();
  } catch {
    req.user = null;
    return next();
  }
};

export const ensureAuthenticated = async (req, res, next) => {
  try {
    const user = req.user || (await resolveAuthenticatedUser(req));
    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({
      error: "Not authenticated. Sign in with GitHub and try again.",
      code: "NOT_AUTHENTICATED",
    });
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token. Sign in again and retry.",
      code: "INVALID_AUTH_TOKEN",
    });
  }
};
