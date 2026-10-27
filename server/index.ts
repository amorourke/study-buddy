import { resolve } from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import { requireAuth } from "./auth.ts";
import { config } from "./config.ts";
import { migrate, seed } from "./db.ts";
import { errorHandler, notFound } from "./errors.ts";
import { authRouter } from "./routes/auth.ts";
import { groupsRouter } from "./routes/groups.ts";
import { createNamedResourceRouter } from "./routes/named-resource.ts";

migrate();
seed();

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/topics", requireAuth, createNamedResourceRouter("topics", "Topic"));
app.use("/api/venues", requireAuth, createNamedResourceRouter("venues", "Venue"));
app.use("/api/groups", requireAuth, groupsRouter);
app.use("/api", () => {
  throw notFound("Endpoint");
});

if (config.isProduction) {
  const clientDir = resolve("dist");
  app.use(express.static(clientDir));
  app.get("/{*path}", (_req, res) => res.sendFile(resolve(clientDir, "index.html")));
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
