/* ===== Lumin PWA Service Worker =====
 * 缓存策略:
 *   - 开发环境(localhost): Network First (始终获取最新)
 *   - 生产环境: Stale-While-Revalidate (优先缓存, 后台更新)
 */

const CACHE_NAME = 'lumin-cache-v2'; // ← 版本号升级，强制清除旧缓存

// 判断是否为本地开发
const IS_LOCALHOST = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.xml',
        '/sitemap.xml',
        '/css/main.css',
        '/js/main.js',
      ]).catch((err) => {
        console.warn('[SW] 预缓存部分资源失败:', err);
      });
    })
  );
  self.skipWaiting(); // 安装后立即激活，不等待旧 SW 退出
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
  self.clients.claim(); // 立即控制所有页面
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源 GET 请求
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // 排除动态路径
  if (url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/')) return;

  // 开发环境：Network First（始终从网络获取最新）
  if (IS_LOCALHOST) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request)) // 网络失败时降级到缓存
    );
    return;
  }

  // 生产环境：Stale-While-Revalidate（优先缓存，后台更新）
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
