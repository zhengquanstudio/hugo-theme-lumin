var toggle, modal, input, closeBtn, results, hintEl;
var indexData = [];
var indexLoaded = false;
var indexLoading = false;
var activeIndex = -1;
var prevFocus = null;

var MAX_RESULTS = ((window.siteConfig && window.siteConfig.searchMaxResults) || 30);

var WEIGHT = { title: 10, tags: 6, categories: 4, summary: 2, content: 1 };

function open() {
  if (!modal) return;
  prevFocus = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  if (input) { input.value = ''; input.focus(); }
  if (results) results.innerHTML = '';
  activeIndex = -1;
  showHint();
  if (!indexLoaded && !indexLoading) loadIndex();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (input) input.value = '';
  if (results) results.innerHTML = '';
  activeIndex = -1;
  hideHint();
  if (prevFocus && prevFocus.focus) prevFocus.focus();
  prevFocus = null;
}

function showHint() {
  if (!hintEl) return;
  hintEl.style.display = 'block';
}

function hideHint() {
  if (!hintEl) return;
  hintEl.style.display = 'none';
}

function loadIndex() {
  indexLoading = true;
  fetch('/index.json').then(function(r) { return r.json(); }).then(function(d) {
    indexData = d || [];
    indexLoaded = true;
    indexLoading = false;
  }).catch(function(e) {
    indexLoading = false;
    console.warn('[Search] 索引加载失败:', e);
    if (results) {
      results.innerHTML = '<div class="search-empty">⚠️ 搜索索引加载失败，请刷新页面重试</div>';
    }
  });
}

function scoreItem(item, keywords) {
  var score = 0;
  var t = (item.title || '').toLowerCase();
  var s = (item.summary || '').toLowerCase();
  var c = (item.content || '').toLowerCase();
  var tags = (item.tags || []).join(' ').toLowerCase();
  var cats = (item.categories || []).join(' ').toLowerCase();

  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i];
    if (!kw) continue;
    if (t.indexOf(kw) > -1) score += WEIGHT.title;
    if (tags.indexOf(kw) > -1) score += WEIGHT.tags;
    if (cats.indexOf(kw) > -1) score += WEIGHT.categories;
    if (s.indexOf(kw) > -1) score += WEIGHT.summary;
    if (c.indexOf(kw) > -1) score += WEIGHT.content;
  }
  return score;
}

function matchItem(item, keywords) {
  var t = (item.title || '').toLowerCase();
  var s = (item.summary || '').toLowerCase();
  var c = (item.content || '').toLowerCase();
  var tags = (item.tags || []).join(' ').toLowerCase();
  var cats = (item.categories || []).join(' ').toLowerCase();
  var all = t + ' ' + tags + ' ' + cats + ' ' + s + ' ' + c;

  for (var i = 0; i < keywords.length; i++) {
    if (keywords[i] && all.indexOf(keywords[i]) === -1) return false;
  }
  return true;
}

function search() {
  var q = (input ? input.value : '').trim();
  if (!q) { if (results) results.innerHTML = ''; showHint(); return; }
  if (!indexLoaded) {
    if (results) results.innerHTML = '<div class="search-empty">⏳ 搜索索引加载中，请稍候...</div>';
    return;
  }
  if (!indexData.length) { if (results) results.innerHTML = ''; return; }

  hideHint();
  activeIndex = -1;

  var keywords = q.toLowerCase().split(/\s+/).filter((k) => { return k.length > 0; });
  if (!keywords.length) { if (results) results.innerHTML = ''; return; }

  var scored = [];
  for (var i = 0; i < indexData.length; i++) {
    var item = indexData[i];
    if (matchItem(item, keywords)) {
      scored.push({ item: item, score: scoreItem(item, keywords) });
    }
  }

  scored.sort(function(a, b) { return b.score - a.score; });
  var matched = scored.slice(0, MAX_RESULTS);

  if (!results) return;

  if (matched.length === 0) {
    results.innerHTML = '<div class="search-empty">🔍 没有找到相关结果<br><small>试试使用多个关键词，如 "Hugo 搜索"</small></div>';
    return;
  }

  results.innerHTML = matched.map((entry) => {
    var item = entry.item;
    var titleHl = highlightMulti(item.title, keywords);
    var snippet = highlightMulti(extractSnippetMulti(item.content || item.summary || '', keywords, 80), keywords);
    var dateStr = item.date || '';
    var catHtml = (item.categories && item.categories.length)
      ? '<span class="search-result-cat">' + item.categories.join(' / ') + '</span>' : '';
    var tagHtml = '';
    if (item.tags && item.tags.length) {
      tagHtml = item.tags.slice(0, 3).map((tag) => {
        return '<span class="search-result-tag">#' + tag + '</span>';
      }).join('');
    }

    return '<a href="' + item.permalink + '" class="search-result-item">' +
      '<div class="search-result-header">' +
        '<h4 class="search-result-title">' + titleHl + '</h4>' +
        (dateStr ? '<span class="search-result-date">' + dateStr + '</span>' : '') +
      '</div>' +
      '<p class="search-result-snippet">' + snippet + '</p>' +
      '<div class="search-result-meta">' + catHtml + tagHtml + '</div>' +
    '</a>';
  }).join('');
}

function highlightMulti(text, keywords) {
  if (!text || !keywords.length) return text || '';
  try {
    var escaped = keywords.filter((k) => { return k; }).map((k) => {
      return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|');
    if (!escaped) return text;
    var re = new RegExp('(' + escaped + ')', 'gi');
    return text.replace(re, '<mark class="search-highlight">$1</mark>');
  } catch(e) { return text; }
}

function extractSnippetMulti(text, keywords, maxLen) {
  if (!text) return '';
  var lower = text.toLowerCase();
  var bestIdx = -1;
  for (var i = 0; i < keywords.length; i++) {
    var idx = lower.indexOf(keywords[i]);
    if (idx > -1) { bestIdx = idx; break; }
  }
  if (bestIdx === -1) return text.substring(0, maxLen).trim() + (text.length > maxLen ? '...' : '');
  var start = Math.max(0, bestIdx - Math.floor(maxLen / 3));
  var end = Math.min(text.length, start + maxLen);
  var snippet = text.substring(start, end).trim();
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';
  return snippet;
}

function navigateResults(dir) {
  if (!results) return;
  var items = results.querySelectorAll('.search-result-item');
  if (!items.length) return;
  items[activeIndex] && items[activeIndex].classList.remove('active');
  activeIndex += dir;
  if (activeIndex < 0) activeIndex = items.length - 1;
  if (activeIndex >= items.length) activeIndex = 0;
  items[activeIndex].classList.add('active');
  items[activeIndex].scrollIntoView({ block: 'nearest' });
}

function trapFocus(e) {
  var container = modal ? modal.querySelector('.search-container') : null;
  if (!container) return;
  var focusable = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

export function init() {
  toggle = document.getElementById('search-toggle');
  modal = document.getElementById('search-overlay');
  input = document.getElementById('search-input');
  closeBtn = document.getElementById('search-close');
  results = document.getElementById('search-results');
  hintEl = document.getElementById('search-hint');

  if (!toggle || !modal) return;

  toggle.addEventListener('click', function(e) { e.preventDefault(); open(); });

  if (closeBtn) closeBtn.addEventListener('click', function(e) { e.preventDefault(); closeModal(); });

  modal.addEventListener('click', function(e) {
    var container = modal.querySelector('.search-container');
    if (e.target === modal || (container && !container.contains(e.target))) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Tab') {
      trapFocus(e);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResults(e.key === 'ArrowDown' ? 1 : -1);
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      var items = results ? results.querySelectorAll('.search-result-item') : [];
      if (items[activeIndex]) items[activeIndex].click();
    }
  });

  if (input) {
    var timer;
    input.addEventListener('input', function() {
      clearTimeout(timer);
      timer = setTimeout(search, 200);
    });
    input.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  if (results) {
    results.addEventListener('click', function(e) {
      var link = e.target.closest('.search-result-item');
      if (link) closeModal();
    });
  }
}
