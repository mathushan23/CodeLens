import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import passport from "./middleware/passport.js";
import { getHealth } from "./controllers/healthController.js";
import { initializeSchema } from "./models/schema.js";
import { testDatabaseConnection } from "./models/db.js";
import authRoutes from "./routes/auth.js";
import reviewRoutes from "./routes/review.js";
import historyRoutes from "./routes/history.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", "..", ".env");

dotenv.config({ path: envPath });

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

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

const startServer = async () => {
  try {
    await testDatabaseConnection();
    await initializeSchema();

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
  } catch (error) {
    console.error("Failed to connect to the database or initialize tables:", error.message);
    process.exit(1);
  }
};

startServer();
