// Prototype-only service worker: exists purely so Chrome/Android will treat
// the app as installable. No caching or offline behavior — everything still
// goes straight to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally empty: fall through to normal network handling.
});
