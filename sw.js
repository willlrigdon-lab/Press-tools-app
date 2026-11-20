/* Page cache for pt-page-v1 (built by tools/build-site.js). Keeps the page itself, never data. */
var CACHE = "pt-page-v1", PREFIX = CACHE.replace(/v\d+$/, ""), WAIT_MS = 3000;
var SKIP = new RegExp("^maintenance/");
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add(new Request(self.registration.scope, { cache: "reload" })); }).catch(function () {}));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf(PREFIX) === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url), scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || url.pathname.indexOf(scope.pathname) !== 0) return;
  var rest = url.pathname.slice(scope.pathname.length);
  if ((SKIP && SKIP.test(rest)) || /(^|\/)(version\.json|sw\.js)$/.test(rest)) return;
  var key = req.mode === "navigate" ? scope.href : url.origin + url.pathname, stored = null;
  var net = fetch(req, { cache: "no-cache" }).then(function (res) {
    if (res && res.ok && res.type === "basic") {
      var copy = res.clone();
      stored = caches.open(CACHE).then(function (c) { return c.put(key, copy); });
    }
    return res;
  });
  e.waitUntil(net.then(function () { return stored; }).catch(function () {}));
  e.respondWith(new Promise(function (resolve, reject) {
    var settled = false;
    function saved(orElse) {
      return caches.match(key).then(function (hit) {
        if (settled) return;
        if (hit) { settled = true; resolve(hit); } else if (orElse) { settled = true; orElse(); }
      });
    }
    var timer = setTimeout(function () { saved(null); }, WAIT_MS);
    net.then(function (res) {
      clearTimeout(timer);
      if (settled) return;
      if (res.ok) { settled = true; resolve(res); } else saved(function () { resolve(res); });
    }, function (err) { clearTimeout(timer); saved(function () { reject(err); }); });
  }));
});
