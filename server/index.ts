import { resolve } from "node:path";
import express from "express";
import { app } from "./app.ts";
import { config } from "./config.ts";
import { ensureDatabase } from "./db.ts";
import { errorHandler } from "./errors.ts";

await ensureDatabase();

if (config.isProduction) {
  const clientDir = resolve("dist");
  app.use(express.static(clientDir));
  app.get("/{*path}", (_req, res) => res.sendFile(resolve(clientDir, "index.html")));
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
