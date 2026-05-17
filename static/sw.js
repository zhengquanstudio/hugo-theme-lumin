/* ===== Lumin PWA Service Worker =====
 * 缓存策略: Stale-While-Revalidate (优先缓存, 后台更新)
 * Hugo 静态站点专用，支持离线访问
 */

const CACHE_NAME = 'lumin-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.xml',
  '/sitemap.xml',
  '/css/main.css',
  '/js/main.js',
  // 图标和字体会在 fetch 时按需缓存
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] 预缓存部分资源失败（离线预览时可能缺失）:', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活事件 - 清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 拦截请求 - Stale-While-Revalidate 策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源 GET 请求
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // 排除 admin / api 等动态路径
  if (url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // 只缓存成功的响应
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // 离线时降级到缓存

      return cachedResponse || fetchPromise;
    })
  );
});
