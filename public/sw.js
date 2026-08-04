// Service worker: installability (unchanged) + runtime caching for a small
// whitelist of GET API endpoints so a handful of screens can show
// last-known data when offline. Everything else falls straight through to
// the network exactly as before.
//
// Matching is path-only, not origin-aware: this file is static (not
// processed by the Next build) so it can't read NEXT_PUBLIC_API_URL at
// build time, and hardcoding the prod API origin would break local dev
// against localhost. The API already returns real CORS responses for this
// app's origin, so cross-origin caching works with no `no-cors` workaround.
const CACHE_VERSION = "v1";
const RUNTIME_CACHE_NAME = `ibookam-runtime-${CACHE_VERSION}`;

const CACHEABLE_PATH_PATTERNS = [
  /\/bookings\/my-bookings(?:$|\?)/,
  /\/bookings\/business\/[^/]+\/metrics(?:$|\?)/,
  /\/spas\/[^/]+\/dashboard(?:$|\?)/,
  /\/spas\/[^/]+\/payment-overview(?:$|\?)/,
  /\/spas\/[^/]+\/bookings(?:$|\?)/,
  /\/spas\/[^/]+\/services(?:$|\?)/,
  /\/spas\/[^/]+\/staff(?:$|\?)/,
];

function isCacheableRequest(request) {
  if (request.method !== "GET") return false;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return false;
  }
  return CACHEABLE_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname + url.search));
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("ibookam-runtime-") && name !== RUNTIME_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!isCacheableRequest(request)) {
    // Intentionally not handled: fall through to normal network handling.
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw err;
      }
    })()
  );
});
