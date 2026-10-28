import { reset } from "./db.ts";

await reset();
console.log("Database reset and seeded with default topics.");
