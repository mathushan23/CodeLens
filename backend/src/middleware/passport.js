import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { upsertGithubUser } from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", "..", "..", ".env");

dotenv.config({ path: envPath });

const isConfiguredValue = (value) => {
  return Boolean(value) && !value.startsWith("your_");
};

const githubAuthEnabled =
  isConfiguredValue(process.env.GITHUB_CLIENT_ID) &&
  isConfiguredValue(process.env.GITHUB_CLIENT_SECRET);

const callbackURL = `${process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`}/auth/github/callback`;

if (githubAuthEnabled) {
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
} else {
  console.warn("GitHub OAuth is disabled. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in the root .env file.");
}

export default passport;
export { githubAuthEnabled };
