import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile();

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET ?? "dev-only-secret";

if (isProduction && jwtSecret === "dev-only-secret") {
  throw new Error("JWT_SECRET must be set in production");
}

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 3000),
  jwtSecret,
  databasePath: process.env.DATABASE_PATH ?? "data/app.db",
  mail: {
    host: process.env.MAIL_HOST ?? "127.0.0.1",
    port: Number(process.env.MAIL_PORT ?? 8025),
    user: process.env.MAIL_USER || undefined,
    password: process.env.MAIL_PASSWORD || undefined,
    from: process.env.MAIL_FROM ?? "no-reply@example.com",
  },
};
