var btn, progressBar, percentEl, commentBtn;
var radius = 22, circumference = 2 * Math.PI * radius;

function update() {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

  if (progressBar) {
    progressBar.style.strokeDashoffset = circumference * (1 - pct);
  }
  if (percentEl) {
    percentEl.textContent = Math.round(pct * 100) + '%';
  }
  if (btn) {
    btn.classList.toggle('visible', scrollTop > 100);
  }

  if (commentBtn) {
    var commentSection = document.querySelector('#post-comments,.post-comments,.comments-section,#tcomment,.music-comments-section,.gal-comments-section');
    if (!commentSection) {
      commentBtn.classList.remove('visible');
    } else {
      var showComment = scrollTop > 300;
      if (showComment) {
        var cTop = commentSection.getBoundingClientRect().top + window.scrollY;
        showComment = scrollTop + window.innerHeight < cTop - 80;
      }
      commentBtn.classList.toggle('visible', showComment);
    }
  }
}

export function init() {
  btn = document.getElementById('back-to-top');
  if (!btn) return;

  progressBar = btn.querySelector('.progress-circle-bar');
  percentEl = btn.querySelector('.btt-percent');
  commentBtn = document.getElementById('scroll-to-comment');

  if (commentBtn) {
    var readingBtn = document.getElementById('reading-mode-toggle');
    if (!readingBtn) {
      var isMobile = window.innerWidth <= 768;
      commentBtn.style.bottom = isMobile ? '6rem' : '9rem';
    }
  }

  if (progressBar) {
    progressBar.style.strokeDasharray = circumference + ' ' + circumference;
    progressBar.style.strokeDashoffset = circumference;
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (commentBtn) {
    commentBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector('#post-comments,.post-comments,.comments-section,#tcomment,.music-comments-section,.gal-comments-section');
      if (!target) return;
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')) || 80;
      var t = target.getBoundingClientRect().top + window.pageYOffset - navH - 20;
      window.scrollTo({ top: t, behavior: 'smooth' });
    });
  }

  update();

  // Swup 页面切换后重新调整按钮
  document.addEventListener('swup:contentReplaced', repositionButtons);
  repositionButtons();
}

function repositionButtons() {
  var rmBtn = document.getElementById('reading-mode-toggle');
  var cmtBtn = document.getElementById('scroll-to-comment');
  var wheel = document.getElementById('rocket-wheel');
  var hasArticle = document.querySelector('.post-content') !== null;

  // 阅读模式按钮显隐
  if (rmBtn) {
    rmBtn.style.display = hasArticle ? '' : 'none';
    if (!hasArticle) {
      rmBtn.classList.remove('visible');
      rmBtn.classList.remove('active');
      document.body.classList.remove('reading-mode');
      try { localStorage.setItem('lumin-reading-mode', '0'); } catch(e) {}
    }
  }

  // 动态调整按钮间距
  var gap = 3.5; // rem
  var base = 5.5; // 火箭底部

  // 火箭容器底部 — 注意 rocket-wheel 是 position:fixed 容器，back-to-top 在其内部
  if (wheel) wheel.style.bottom = base + 'rem';

  // 阅读模式在火箭上方（可见时），注意：即使隐藏也要保留 1 倍 gap 位置
  if (rmBtn) {
    rmBtn.style.bottom = (base + (hasArticle ? gap : 0)) + 'rem';
  }

  // 评论气泡在阅读模式上方（有评论区时）
  // 注意：阅读模式按钮的间距始终保留，防止归档等页面产生空隙
  if (cmtBtn) {
    var hasComments = document.querySelector('#post-comments,.post-comments,.comments-section,#tcomment,.music-comments-section,.gal-comments-section');
    cmtBtn.style.bottom = (base + gap + (hasComments ? gap : 0)) + 'rem';
    if (!hasComments) cmtBtn.classList.remove('visible');
  }
}
