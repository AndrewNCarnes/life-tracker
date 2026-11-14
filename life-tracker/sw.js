/* Offline support for Life Tracker Check-in.
   - The page itself is fetched from the network first, so an update you push shows up the next
     time the app opens online. Offline (or on a slow connection) it falls back to the saved copy.
   - Fonts, icons and the Excel library never change under the same name, so they come from the cache.
   Bump VERSION if you ever replace a file in fonts/, icons/ or vendor/ without renaming it. */
const VERSION = "v1";
const CACHE = "life-tracker-" + VERSION;
const CORE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "fonts/newsreader-latin-400-normal.woff2",
  "fonts/newsreader-latin-400-italic.woff2",
  "fonts/schibsted-grotesk-latin-400-normal.woff2",
  "fonts/schibsted-grotesk-latin-500-normal.woff2",
  "fonts/schibsted-grotesk-latin-600-normal.woff2",
  "fonts/jetbrains-mono-latin-400-normal.woff2",
  "fonts/jetbrains-mono-latin-600-normal.woff2",
  "vendor/xlsx.full.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE.map(u => new Request(u, {cache: "reload"}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("life-tracker-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const STATIC = /\/(fonts|icons|vendor)\//;
const usable = res => res && res.status === 200 && res.type === "basic" && !res.redirected;

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request, {ignoreSearch: true});
  if (hit) return hit;
  const res = await fetch(request);
  if (usable(res)) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const fallback = async () =>
    (await cache.match(request, {ignoreSearch: true})) ||
    (request.mode === "navigate" ? ((await cache.match("./")) || (await cache.match("index.html"))) : undefined);
  try {
    const res = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 3500);
      fetch(request.url, {cache: "no-cache", credentials: "same-origin"})
        .then(r => { clearTimeout(timer); resolve(r); }, e => { clearTimeout(timer); reject(e); });
    });
    if (usable(res)) { cache.put(request.url, res.clone()); return res; }
    if (res.redirected && request.mode === "navigate") return Response.redirect(res.url, 302);
    return (await fallback()) || res;
  } catch (e) {
    const hit = await fallback();
    if (hit) return hit;
    throw e;
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(STATIC.test(url.pathname) ? cacheFirst(request) : networkFirst(request));
});
