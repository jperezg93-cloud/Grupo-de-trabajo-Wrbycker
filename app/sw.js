/* Offline app shell v10. Scoped to this installed PWA location.
 * Never cache personal content; only static files checked into the repository.
 */
"use strict";
const SCOPE = self.registration.scope;
const SCOPE_KEY = new URL(SCOPE).pathname.replace(/[^a-z0-9]/gi, "-");
const PREFIX = "wrbycker-control-" + SCOPE_KEY + "-";
const CACHE = PREFIX + "v10";
const CORE = ["index.html", "app.css", "logic.js", "app.js", "manifest.webmanifest"];
const OPTIONAL = ["../docs/brand/wb-icon.svg", "../docs/app/wb-icon-192-v2.png", "../docs/app/wb-icon-512-v2.png", "../docs/favicon.svg"];
const asset = (name) => new URL(name, SCOPE).href;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // The complete app shell must be saved before the worker activates.
    await cache.addAll(CORE.map(asset));
    // Missing icon/favicons must not break offline installation.
    await Promise.allSettled(OPTIONAL.map((name) => cache.add(asset(name))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) =>
      (name.startsWith(PREFIX) && name !== CACHE) ||
      name === "wrbycker-control-v1"
    ).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin ||
      !url.pathname.startsWith(new URL(SCOPE).pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      // Prefer fresh app HTML online; preserve the cached shell for offline use.
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(request);
        if (fresh.ok && fresh.type === "basic") {
          await cache.put(asset("index.html"), fresh.clone()).catch(() => {});
          return fresh;
        }
      } catch (_) { /* Offline: fall back to the saved app shell. */ }
      const shell = await cache.match(asset("index.html"));
      if (shell) return shell;
      return fetch(request);
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  })());
});
