import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { findUserById, upsertGithubUser } from "../models/userModel.js";

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

const callbackURL = `${process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`}/auth/github/callback`;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertGithubUser(profile);
        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

export default passport;
