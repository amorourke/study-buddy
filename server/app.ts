import cookieParser from "cookie-parser";
import express from "express";
import { requireAuth } from "./auth.ts";
import { ensureDatabase } from "./db.ts";
import { notFound } from "./errors.ts";
import { authRouter } from "./routes/auth.ts";
import { groupsRouter } from "./routes/groups.ts";
import { createNamedResourceRouter } from "./routes/named-resource.ts";

export const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());

app.use("/api", async (_req, _res, next) => {
  await ensureDatabase();
  next();
});
app.use("/api/auth", authRouter);
app.use("/api/topics", requireAuth, createNamedResourceRouter("topics", "Topic"));
app.use("/api/venues", requireAuth, createNamedResourceRouter("venues", "Venue"));
app.use("/api/groups", requireAuth, groupsRouter);
app.use("/api", () => {
  throw notFound("Endpoint");
});
