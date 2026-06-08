/**
 * 站内新文章订阅通知 - 纯前端实现
 *
 * 原理：读取 Hugo 自动生成的 /index.xml (RSS Feed)，
 * 与 localStorage 中的最后访问时间比较，
 * 有新文章时在工具栏铃铛按钮上显示角标。
 *
 * 零服务、零配置、零依赖。
 */

var SUB_KEY = 'lumin_sub_lastvisit';
var SUB_CACHE_KEY = 'lumin_sub_feed_cache';

export function init() {
  var btn = document.getElementById('sub-btn');
  if (!btn) return;

  var badge = document.getElementById('sub-badge');
  var panel = document.getElementById('sub-panel');
  var body = document.getElementById('sub-panel-body');
  var closeBtn = document.getElementById('sub-panel-close');

  // 获取缓存或拉取 RSS
  function getFeed() {
    var cached = getCache();
    if (cached) return Promise.resolve(cached);

    return fetch('/index.xml')
      .then(function(r) { return r.text(); })
      .then(function(xmlStr) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlStr, 'text/xml');
        var items = doc.querySelectorAll('item');
        var entries = [];
        items.forEach(function(item) {
          var title = (item.querySelector('title') || {}).textContent || '';
          var link = (item.querySelector('link') || {}).textContent || '';
          var pubDate = (item.querySelector('pubDate') || {}).textContent || '';
          var desc = (item.querySelector('description') || {}).textContent || '';
          entries.push({ title: title, link: link, pubDate: pubDate, desc: desc });
        });
        setCache(entries);
        return entries;
      })
      .catch(function() { return []; });
  }

  // 检查是否有新文章
  function checkNewArticles(entries) {
    var lastVisit = parseInt(localStorage.getItem(SUB_KEY), 10) || 0;
    var newCount = 0;
    entries.forEach(function(e) {
      var ts = new Date(e.pubDate).getTime();
      if (ts > lastVisit) newCount++;
    });
    return newCount;
  }

  // 渲染面板内容
  function renderPanel(entries) {
    if (!body) return;
    if (!entries || entries.length === 0) {
      body.innerHTML = '<div class="sub-empty"><i class="fas fa-inbox"></i><span>暂无文章</span></div>';
      return;
    }
    // 只显示最近 10 篇
    var list = entries.slice(0, 10);
    var html = '<div class="sub-article-list">';
    list.forEach(function(e) {
      var ts = new Date(e.pubDate).getTime();
      var now = Date.now();
      var timeStr = formatTime(ts);
      html += '<a href="' + escapeHtml(e.link) + '" class="sub-article-item" target="_blank" rel="noopener noreferrer">' +
        '<div class="sub-article-title">' + escapeHtml(e.title) + '</div>' +
        '<div class="sub-article-meta">' + timeStr + '</div>' +
        '</a>';
    });
    html += '</div>';
    body.innerHTML = html;

    // 用户打开面板视为已读，更新最后访问时间
    localStorage.setItem(SUB_KEY, String(Date.now()));
    updateBadge(entries);
  }

  // 更新角标
  function updateBadge(entries) {
    var count = checkNewArticles(entries);
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // 面板切换
  function togglePanel() {
    if (!panel) return;
    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = 'flex';
    body.innerHTML = '<div class="sub-loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>';
    getFeed().then(function(entries) {
      renderPanel(entries);
    });
  }

  function closePanel() {
    if (panel) panel.style.display = 'none';
  }

  // 事件绑定
  btn.addEventListener('click', togglePanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  // 点击外部关闭面板
  document.addEventListener('click', function(e) {
    if (panel && panel.style.display === 'flex') {
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        closePanel();
      }
    }
  });

  // 初始化：加载 RSS 并更新角标
  getFeed().then(function(entries) {
    updateBadge(entries);
  });
}

// ── 辅助函数 ──

function getCache() {
  try {
    var raw = localStorage.getItem(SUB_CACHE_KEY);
    if (!raw) return null;
    var data = JSON.parse(raw);
    // 缓存 15 分钟
    if (Date.now() - data.ts > 15 * 60 * 1000) return null;
    return data.entries;
  } catch(e) { return null; }
}

function setCache(entries) {
  try {
    localStorage.setItem(SUB_CACHE_KEY, JSON.stringify({ ts: Date.now(), entries: entries }));
  } catch(e) {}
}

function formatTime(ts) {
  var now = Date.now();
  var diff = now - ts;
  if (diff < 3600000) return Math.round(diff / 60000) + ' 分钟前';
  if (diff < 86400000) return Math.round(diff / 3600000) + ' 小时前';
  if (diff < 604800000) return Math.round(diff / 86400000) + ' 天前';
  var d = new Date(ts);
  var m = (d.getMonth() + 1);
  var day = d.getDate();
  return m + '/' + day;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
