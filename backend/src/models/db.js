import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", "..", "..", ".env");

dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in the root .env file.");
}

const parsedUrl = new URL(databaseUrl);
const sslAccept = parsedUrl.searchParams.get("sslaccept");
const sslMode = process.env.DB_SSL_MODE || sslAccept || "strict";

parsedUrl.searchParams.delete("sslaccept");

const resolveSslOptions = (mode) => {
  if (mode === "off") {
    return undefined;
  }

  if (mode === "accept_invalid_certs" || mode === "insecure") {
    return { rejectUnauthorized: false };
  }

  return { rejectUnauthorized: true };
};

const pool = mysql.createPool({
  uri: parsedUrl.toString(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: resolveSslOptions(sslMode),
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const getConnection = async () => {
  return pool.getConnection();
};

export const testDatabaseConnection = async () => {
  try {
    await query("SELECT 1");
  } catch (error) {
    if (error.message?.includes("self-signed certificate in certificate chain")) {
      throw new Error(
        "MySQL SSL verification failed. For Aiven, either add DB_SSL_MODE=insecure for local development or configure a trusted CA certificate.",
      );
    }

    throw error;
  }
};

export default pool;
