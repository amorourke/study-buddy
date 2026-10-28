// Packages the app for Vercel using the Build Output API (https://vercel.com/docs/build-output-api):
// the Vite build in dist/ is served as static files and the Express API runs as one serverless function.
// Runs after `npm run build` via the `vercel-build` script.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const output = ".vercel/output";
const functionDir = `${output}/functions/api.func`;

rmSync(output, { recursive: true, force: true });
cpSync("dist", `${output}/static`, { recursive: true });
mkdirSync(functionDir, { recursive: true });

await build({
  entryPoints: ["server/vercel.ts"],
  outfile: `${functionDir}/index.mjs`,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  // The web client talks to Turso over HTTP and has no native binaries to bundle.
  alias: { "@libsql/client": "@libsql/client/web" },
  // Lets bundled CommonJS packages such as Express call require() from an ES module.
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
});

writeFileSync(
  `${functionDir}/.vc-config.json`,
  JSON.stringify({ runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs" }, null, 2),
);

writeFileSync(
  `${output}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/api(?:/.*)?", dest: "/api" },
        { src: "/.*", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

console.log(`Vercel output written to ${output}`);
