// Minimal service worker — its presence (with a fetch handler) makes the site
// installable as an app. It doesn't cache; requests pass straight through to the
// network so content is always fresh.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // no-op: let the browser handle every request normally
});

// ── Push notifications (new enquiries) ──────────────────────────────────────
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }
  const title = payload.title || "DIG Driving School";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: "/icon.png",
    badge: "/icon.png",
    data: { url: payload.url || "/admin/enquiries" },
    tag: payload.url || "dds-notification",
  };
  const tasks = [self.registration.showNotification(title, options)];
  // Put the new-enquiry count on the app icon (red number), like Mail/Messages.
  if (typeof payload.count === "number" && "setAppBadge" in self.navigator) {
    tasks.push(self.navigator.setAppBadge(payload.count).catch(() => {}));
  }
  event.waitUntil(Promise.all(tasks));
});

// Tapping the notification opens (or focuses) the target enquiry.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/admin/enquiries";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
