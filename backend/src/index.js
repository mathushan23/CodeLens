import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import passport from "./middleware/passport.js";
import { getHealth } from "./controllers/healthController.js";
import authRoutes from "./routes/auth.js";
import reviewRoutes from "./routes/review.js";
import historyRoutes from "./routes/history.js";

dotenv.config();

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/history", historyRoutes);

app.get("/api/health", getHealth);

const DEFAULT_PORT = 5000;
const portValue = process.env.PORT ?? DEFAULT_PORT;
const PORT = Number.parseInt(portValue, 10);

if (Number.isNaN(PORT) || PORT <= 0) {
  console.error(`Invalid PORT value "${portValue}". Set PORT to a positive number.`);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the existing process or set a different PORT in your environment.`,
    );
    process.exit(1);
  }

  console.error("Failed to start backend server:", error);
  process.exit(1);
});
