import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile();

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET must be set (see .env.example)");
}

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 3000),
  jwtSecret,
  databaseUrl: process.env.TURSO_DATABASE_URL || "file:data/app.db",
  databaseAuthToken: process.env.TURSO_AUTH_TOKEN || undefined,
};
