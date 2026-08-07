// Custom Next.js server for Plesk / Passenger hosting (IONOS).
// Passenger runs this file as the app entry point and provides PORT;
// we hand all requests to Next. Mirrors the JTO restaurant-platform setup.
const { createServer } = require("http");
const { parse } = require("url");
// Ensure .env / .env.production / .env.local are loaded under the custom server.
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(__dirname);
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, () => {
    console.log(`> Server ready on port ${port}`);
  });
});
