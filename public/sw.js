// Offline cache for the PickMe app shell + dataset.
// Bump CACHE to invalidate previously cached shells/assets on deploy.
const CACHE = 'pickme-v2'
const ASSETS = ['./', './index.html', './instruments.json', './manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return

  // Network-first for page navigations so a fresh deploy's index.html — which
  // points at newly hashed assets — is always used; fall back to cache offline.
  // (A cache-first shell was serving a stale index.html that referenced JS
  // filenames removed by later deploys, blanking the app.)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./')))
    )
    return
  }

  // Cache-first for everything else — hashed assets are immutable.
  e.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((res) => {
      const copy = res.clone()
      caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
      return res
    }))
  )
})
