// Minimal service worker — its presence (with a fetch handler) makes the site
// installable as an app. It doesn't cache; requests pass straight through to the
// network so content is always fresh.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // no-op: let the browser handle every request normally
});
