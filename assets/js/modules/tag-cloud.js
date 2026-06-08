var palette = [
  '#4a47a3', '#8e44ad', '#c0392b', '#2980b9',
  '#16a085', '#d35400', '#8e44ad', '#2c3e50',
  '#e74c3c', '#27ae60', '#f39c12', '#1abc9c',
  '#7d3c98', '#2e86c1', '#cb4335', '#28b463',
  '#d68910', '#148f77', '#6c3483', '#1a5276',
  '#b03a2e', '#1e8449', '#b9770e', '#117a65'
];

var activeTag = null;
var balls = [];
var animId = null;
var wallRect = null;
var currentPage = 1;
var pageSize = 15;
var currentArticles = [];
var hoveredBall = null;

export function init() {
  initFloatingTags();
  initArticlePanel();
  readPageSize();
}

function readPageSize() {
  var wall = document.getElementById('tag-cloud-wall');
  if (wall) {
    var ps = wall.getAttribute('data-page-size');
    if (ps) {
      var n = parseInt(ps, 10);
      if (n > 0) pageSize = n;
    }
  }
}

function updateWallHeight() {
  var wall = document.getElementById('tag-cloud-wall');
  if (!wall) return;
  var items = wall.querySelectorAll('.tag-wall-item');
  if (!items.length) return;

  wall.style.minHeight = '';

  items.forEach(function (t) {
    t.style.position = 'relative';
    t.style.left = '';
    t.style.top = '';
  });

  var naturalHeight = wall.scrollHeight;

  items.forEach(function (t) {
    t.style.position = 'absolute';
  });

  var floatHeight = Math.max(300, Math.ceil(naturalHeight * 1.8));
  wall.style.minHeight = floatHeight + 'px';
}

function initFloatingTags() {
  var wall = document.getElementById('tag-cloud-wall');
  if (!wall) return;

  var items = wall.querySelectorAll('.tag-wall-item');
  if (!items.length) return;

  var maxCount = 1;
  items.forEach(function (t) {
    var c = parseInt(t.getAttribute('data-count') || '1', 10);
    if (c > maxCount) maxCount = c;
  });

  wallRect = wall.getBoundingClientRect();
  balls = [];

  items.forEach(function (t, i) {
    var c = parseInt(t.getAttribute('data-count') || '1', 10);
    var ratio = c / maxCount;
    var color = palette[i % palette.length];
    var fontSize = 0.8 + ratio * 0.35;

    t.style.fontSize = fontSize + 'rem';
    t.style.color = color;
    t.style.background = hexToRgba(color, 0.15);
    t.style.borderColor = hexToRgba(color, 0.4);
    t.style.position = 'absolute';

    var speed = 0.35 + Math.random() * 0.5;
    var angle = Math.random() * Math.PI * 2;
    var vx = Math.cos(angle) * speed;
    var vy = Math.sin(angle) * speed;

    balls.push({
      el: t,
      x: 0,
      y: 0,
      vx: vx,
      vy: vy,
      w: 0,
      h: 0,
      frozen: false
    });

    t.addEventListener('mouseenter', function () {
      for (var k = 0; k < balls.length; k++) {
        if (balls[k].el === t) {
          balls[k].frozen = true;
          hoveredBall = balls[k];
          break;
        }
      }
    });

    t.addEventListener('mouseleave', function () {
      for (var k = 0; k < balls.length; k++) {
        if (balls[k].el === t) {
          balls[k].frozen = false;
          hoveredBall = null;
          break;
        }
      }
    });
  });

  requestAnimationFrame(function () {
    updateWallHeight();

    wallRect = wall.getBoundingClientRect();
    var wW = wall.clientWidth;
    var wH = wall.clientHeight;

    balls.forEach(function (b) {
      var r = b.el.getBoundingClientRect();
      b.w = r.width;
      b.h = r.height;
      b.x = Math.random() * Math.max(1, wW - b.w);
      b.y = Math.random() * Math.max(1, wH - b.h);
      b.el.style.left = b.x + 'px';
      b.el.style.top = b.y + 'px';
    });

    if (animId) cancelAnimationFrame(animId);
    animateFloat();
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateWallHeight();
      wallRect = wall.getBoundingClientRect();

      var wW = wall.clientWidth;
      var wH = wall.clientHeight;
      balls.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        b.w = r.width;
        b.h = r.height;
        if (b.x + b.w > wW) b.x = Math.max(0, wW - b.w);
        if (b.y + b.h > wH) b.y = Math.max(0, wH - b.h);
        b.el.style.left = b.x + 'px';
        b.el.style.top = b.y + 'px';
      });
    }, 200);
  });
}

function animateFloat() {
  var wall = document.getElementById('tag-cloud-wall');
  if (!wall) return;

  var wW = wall.clientWidth;
  var wH = wall.clientHeight;

  for (var i = 0; i < balls.length; i++) {
    var b = balls[i];

    if (b.frozen) continue;

    b.x += b.vx;
    b.y += b.vy;

    if (b.x <= 0) { b.x = 0; b.vx = Math.abs(b.vx); }
    if (b.y <= 0) { b.y = 0; b.vy = Math.abs(b.vy); }
    if (b.x + b.w >= wW) { b.x = wW - b.w; b.vx = -Math.abs(b.vx); }
    if (b.y + b.h >= wH) { b.y = wH - b.h; b.vy = -Math.abs(b.vy); }

    b.el.style.left = b.x + 'px';
    b.el.style.top = b.y + 'px';
  }

  for (var i = 0; i < balls.length; i++) {
    for (var j = i + 1; j < balls.length; j++) {
      var a = balls[i];
      var b = balls[j];

      var overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      var overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);

      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          var sign = (a.x + a.w / 2) < (b.x + b.w / 2) ? -1 : 1;
          if (!a.frozen) a.x += sign * overlapX / 2;
          if (!b.frozen) b.x -= sign * overlapX / 2;
          if (!a.frozen && !b.frozen) {
            var tmpVx = a.vx;
            a.vx = b.vx;
            b.vx = tmpVx;
          } else if (a.frozen) {
            b.vx = -b.vx;
          } else {
            a.vx = -a.vx;
          }
        } else {
          var sign = (a.y + a.h / 2) < (b.y + b.h / 2) ? -1 : 1;
          if (!a.frozen) a.y += sign * overlapY / 2;
          if (!b.frozen) b.y -= sign * overlapY / 2;
          if (!a.frozen && !b.frozen) {
            var tmpVy = a.vy;
            a.vy = b.vy;
            b.vy = tmpVy;
          } else if (a.frozen) {
            b.vy = -b.vy;
          } else {
            a.vy = -a.vy;
          }
        }

        a.x = Math.max(0, Math.min(a.x, wW - a.w));
        a.y = Math.max(0, Math.min(a.y, wH - a.h));
        b.x = Math.max(0, Math.min(b.x, wW - b.w));
        b.y = Math.max(0, Math.min(b.y, wH - b.h));
      }
    }
  }

  animId = requestAnimationFrame(animateFloat);
}

function initArticlePanel() {
  var wall = document.getElementById('tag-cloud-wall');
  if (!wall) return;

  var articlesEl = document.getElementById('tag-articles');
  var articlesList = document.getElementById('tag-articles-list');
  var articlesTitle = document.getElementById('tag-articles-title');
  var closeBtn = document.getElementById('tag-articles-close');
  if (!articlesEl || !articlesList || !articlesTitle) return;

  wall.addEventListener('click', function (e) {
    var item = e.target.closest('.tag-wall-item');
    if (!item) return;

    e.preventDefault();

    var tagName = item.getAttribute('data-tag');
    var articlesRaw = item.getAttribute('data-articles');
    if (!tagName) return;

    wall.querySelectorAll('.tag-wall-item').forEach(function (t) {
      t.classList.remove('tag-wall-item--active');
    });
    item.classList.add('tag-wall-item--active');

    currentArticles = parseArticles(articlesRaw);
    currentPage = 1;
    articlesTitle.textContent = tagName + '（' + currentArticles.length + ' 篇）';

    renderArticles();

    articlesEl.classList.add('tag-articles--visible');

    setTimeout(function () {
      articlesEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    activeTag = tagName;
  });

  closeBtn.addEventListener('click', function () {
    articlesEl.classList.remove('tag-articles--visible');
    wall.querySelectorAll('.tag-wall-item').forEach(function (t) {
      t.classList.remove('tag-wall-item--active');
    });
    activeTag = null;
  });
}

function renderArticles() {
  var articlesList = document.getElementById('tag-articles-list');
  var paginationEl = document.getElementById('tag-articles-pagination');
  if (!articlesList) return;

  articlesList.innerHTML = '';

  var totalPages = Math.ceil(currentArticles.length / pageSize);
  var start = (currentPage - 1) * pageSize;
  var end = Math.min(start + pageSize, currentArticles.length);
  var pageArticles = currentArticles.slice(start, end);

  var grid = document.createElement('div');
  grid.className = 'tag-article-grid';

  pageArticles.forEach(function (article) {
    var card = document.createElement('a');
    card.href = article.url;
    card.className = 'tag-article-card';

    var thumb = document.createElement('div');
    thumb.className = 'tag-article-thumb';
    var img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    img.loading = 'lazy';
    thumb.appendChild(img);

    var body = document.createElement('div');
    body.className = 'tag-article-card-body';

    var meta = document.createElement('div');
    meta.className = 'tag-article-card-meta';

    var dateEl = document.createElement('span');
    dateEl.className = 'tag-article-card-date';
    dateEl.textContent = article.date;
    meta.appendChild(dateEl);

    if (article.category) {
      var catEl = document.createElement('span');
      catEl.className = 'tag-article-card-cat';
      catEl.textContent = article.category;
      meta.appendChild(catEl);
    }

    if (article.readingTime) {
      var rtEl = document.createElement('span');
      rtEl.className = 'tag-article-card-rt';
      rtEl.textContent = article.readingTime + ' 分钟';
      meta.appendChild(rtEl);
    }

    if (article.wordCount) {
      var wcEl = document.createElement('span');
      wcEl.className = 'tag-article-card-wc';
      wcEl.textContent = article.wordCount + ' 字';
      meta.appendChild(wcEl);
    }

    var titleEl = document.createElement('span');
    titleEl.className = 'tag-article-card-title';
    titleEl.textContent = article.title;

    body.appendChild(meta);
    body.appendChild(titleEl);

    if (article.desc) {
      var descEl = document.createElement('p');
      descEl.className = 'tag-article-card-desc';
      descEl.textContent = article.desc;
      body.appendChild(descEl);
    }

    card.appendChild(thumb);
    card.appendChild(body);
    grid.appendChild(card);
  });

  articlesList.appendChild(grid);

  if (paginationEl) {
    paginationEl.innerHTML = '';
    if (totalPages > 1) {
      var nav = document.createElement('div');
      nav.className = 'tag-pagination';

      for (var p = 1; p <= totalPages; p++) {
        var btn = document.createElement('button');
        btn.className = 'tag-pagination-btn' + (p === currentPage ? ' tag-pagination-btn--active' : '');
        btn.textContent = p;
        btn.setAttribute('data-page', p);
        btn.addEventListener('click', function () {
          currentPage = parseInt(this.getAttribute('data-page'), 10);
          renderArticles();
          var articlesEl = document.getElementById('tag-articles');
          if (articlesEl) {
            articlesEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
        nav.appendChild(btn);
      }

      paginationEl.appendChild(nav);
    }
  }
}

function parseArticles(raw) {
  if (!raw) return [];
  var decoded = raw.replace(/&#43;/g, '+').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  var entries = decoded.split(';').filter(function (s) { return s.trim() && s.indexOf('|') > 0; });
  var result = [];
  entries.forEach(function (entry) {
    var parts = entry.split('|');
    if (parts.length >= 3) {
      result.push({
        title: parts[0].trim(),
        url: parts[1].trim(),
        date: parts[2].trim(),
        image: (parts[3] || '').trim() || '/images/default-cover.webp',
        category: (parts[4] || '').trim(),
        readingTime: (parts[5] || '').trim(),
        wordCount: (parts[6] || '').trim(),
        desc: (parts[7] || '').trim()
      });
    }
  });
  return result;
}

function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}
