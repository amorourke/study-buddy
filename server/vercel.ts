import { app } from "./app.ts";
import { errorHandler } from "./errors.ts";

// Entry point for the Vercel serverless function; static files are served by Vercel itself.
app.use(errorHandler);

export default app;
