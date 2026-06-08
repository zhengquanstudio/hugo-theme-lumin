var toggleBtn;
var STORAGE_KEY = 'lumin-reading-mode';

export function init() {
  toggleBtn = document.getElementById('reading-mode-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', function() {
    var isActive = document.body.classList.toggle('reading-mode');
    toggleBtn.classList.toggle('active', isActive);
    toggleBtn.title = isActive ? '退出沉浸阅读' : '沉浸阅读';
    toggleBtn.setAttribute('aria-label', isActive ? '退出沉浸阅读' : '沉浸阅读');

    try {
      localStorage.setItem(STORAGE_KEY, isActive ? '1' : '0');
    } catch(e) {}

    if (isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('reading-mode')) {
      document.body.classList.remove('reading-mode');
      toggleBtn.classList.remove('active');
      toggleBtn.title = '沉浸阅读';
      toggleBtn.setAttribute('aria-label', '沉浸阅读');
      try { localStorage.setItem(STORAGE_KEY, '0'); } catch(e) {}
    }
  });

  // 恢复上一次的阅读模式状态
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '1') {
      document.body.classList.add('reading-mode');
      toggleBtn.classList.add('active');
      toggleBtn.title = '退出沉浸阅读';
      toggleBtn.setAttribute('aria-label', '退出沉浸阅读');
    }
  } catch(e) {}

  // 滚动控制按钮显隐 — 统一使用 .visible class

  // 滚动控制按钮显隐 — 统一使用 .visible class
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateVisibility();
}

function updateVisibility() {
  if (!toggleBtn) return;
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  // 滚动超过 200px 显示按钮（与火箭按钮一致使用 .visible class）
  toggleBtn.classList.toggle('visible', scrollTop > 200);
}
