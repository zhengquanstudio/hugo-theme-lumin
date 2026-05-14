/**
 * Hugo Theme Lumin - Main JavaScript
 */

(function() {
  'use strict';

  // 获取 Banner 配置（优先从 window.LUMIN_BANNER 读取）
  function getBannerConfig() {
    if (window.LUMIN_BANNER) return window.LUMIN_BANNER;
    var el = document.getElementById('banner-config');
    if (el) {
      try { return JSON.parse(el.textContent); } catch (e) { /* ignore */ }
    }
    return {};
  }

  // ==========================================
  // Banner Slideshow - 背景图轮播（交叉淡入淡出）
  // ==========================================
  var BannerSlideshow = {
    init: function() {
      this.slides = document.querySelectorAll('.banner-slide');
      if (this.slides.length < 2) return;

      this.currentIndex = 0;
      this.totalSlides = this.slides.length;
      this.config = getBannerConfig();
      this.interval = (this.config.interval || 6000);

      // 预加载所有背景图
      this.preloadImages();

      // 启动定时轮播
      var self = this;
      this.timer = setInterval(function() { self.next(); }, this.interval);
    },

    preloadImages: function() {
      var imgs = document.querySelectorAll('.banner-slide-image');
      imgs.forEach(function(img) {
        var src = img.getAttribute('src');
        if (src) {
          var preloader = new Image();
          preloader.src = src;
        }
      });
    },

    next: function() {
      var current = this.slides[this.currentIndex];
      var nextIndex = (this.currentIndex + 1) % this.totalSlides;
      var next = this.slides[nextIndex];

      // 交叉淡入淡出：先让下一张就位（opacity不变），再同时淡出当前+淡入下一张
      // 下一张先设为可见但透明（z-index低于当前）
      next.style.zIndex = '0';
      next.style.opacity = '0';
      next.classList.add('active');

      // 强制重绘
      next.offsetHeight;

      // 下一张淡入到1，当前淡出到0（CSS transition 同时执行）
      next.style.opacity = '1';
      next.style.zIndex = '1';
      current.style.opacity = '0';
      current.style.zIndex = '0';

      this.currentIndex = nextIndex;

      // 过渡完成后清理
      var self = this;
      setTimeout(function() {
        current.classList.remove('active');
        current.style.opacity = '';
        current.style.zIndex = '';
        next.style.opacity = '';
        next.style.zIndex = '';
      }, 1600);
    }
  };

  // ==========================================
  // Typewriter Effect - 打字机效果
  // ==========================================
  var Typewriter = {
    init: function() {
      this.element = document.getElementById('typewriter-text');
      if (!this.element) return;

      this.config = getBannerConfig();

      // 获取句子列表
      this.texts = this.config.subtitles || [];
      if (!this.texts.length || !this.texts[0]) {
        this.texts = ['记录生活，分享技术'];
      }

      this.textIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.typingSpeed = (this.config.typingSpeed || 120);
      this.deletingSpeed = (this.config.deletingSpeed || 60);
      this.pauseTime = (this.config.pauseTime || 2500);

      // 延迟启动
      var self = this;
      setTimeout(function() { self.type(); }, 600);
    },

    type: function() {
      var text = this.texts[this.textIndex];
      if (!text) {
        this.textIndex = 0;
        text = this.texts[0];
      }

      var self = this;

      if (this.isDeleting) {
        // 逐字删除
        this.charIndex--;
        this.element.textContent = text.substring(0, this.charIndex);

        if (this.charIndex <= 0) {
          // 删完了，换下一句
          this.isDeleting = false;
          this.textIndex = (this.textIndex + 1) % this.texts.length;
          setTimeout(function() { self.type(); }, 500);
        } else {
          setTimeout(function() { self.type(); }, this.deletingSpeed);
        }
      } else {
        // 逐字显示
        this.charIndex++;
        this.element.textContent = text.substring(0, this.charIndex);

        if (this.charIndex >= text.length) {
          // 显示完了，暂停后开始删除
          this.isDeleting = true;
          setTimeout(function() { self.type(); }, this.pauseTime);
        } else {
          setTimeout(function() { self.type(); }, this.typingSpeed);
        }
      }
    }
  };

  // ==========================================
  // Theme Toggle
  // ==========================================
  var ThemeToggle = {
    init: function() {
      this.toggle = document.getElementById('theme-toggle');
      if (!this.toggle) return;
      this.html = document.documentElement;
      this.key = 'lumin-theme';

      var saved = localStorage.getItem(this.key);
      if (saved) this.html.setAttribute('data-theme', saved);

      var self = this;
      this.toggle.addEventListener('click', function() {
        var cur = self.html.getAttribute('data-theme') || 'light';
        var next = cur === 'dark' ? 'light' : 'dark';
        self.html.setAttribute('data-theme', next);
        localStorage.setItem(self.key, next);
      });
    }
  };

  // ==========================================
  // Mobile Menu
  // ==========================================
  var MobileMenu = {
    init: function() {
      var toggle = document.getElementById('mobile-menu-toggle');
      var menu = document.getElementById('mobile-menu');
      if (!toggle || !menu) return;

      toggle.addEventListener('click', function() { menu.classList.toggle('active'); });
      document.addEventListener('click', function(e) {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
    }
  };

  // ==========================================
  // Search
  // ==========================================
  var Search = {
    init: function() {
      this.toggle = document.getElementById('search-toggle');
      this.modal = document.getElementById('search-modal');
      this.input = document.getElementById('search-input');
      this.close = document.getElementById('search-close');
      this.results = document.getElementById('search-results');
      if (!this.toggle || !this.modal) return;

      var self = this;
      this.toggle.addEventListener('click', function() { self.open(); });
      if (this.close) this.close.addEventListener('click', function() { self.closeModal(); });
      this.modal.addEventListener('click', function(e) { if (e.target === self.modal) self.closeModal(); });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && self.modal.classList.contains('active')) self.closeModal();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); self.open(); }
      });

      if (this.input) {
        var timer;
        this.input.addEventListener('input', function() {
          clearTimeout(timer);
          timer = setTimeout(function() { self.search(); }, 300);
        });
      }

      var s = this;
      fetch('/index.json').then(function(r) { return r.json(); }).then(function(d) { s.index = d; }).catch(function() {});
    },

    open: function() {
      this.modal.classList.add('active');
      if (this.input) this.input.focus();
    },

    closeModal: function() {
      this.modal.classList.remove('active');
      if (this.input) this.input.value = '';
      if (this.results) this.results.innerHTML = '';
    },

    search: function() {
      var q = (this.input ? this.input.value : '').trim().toLowerCase();
      if (!q || !this.index) { if (this.results) this.results.innerHTML = ''; return; }
      var results = this.index.filter(function(item) {
        return (item.title && item.title.toLowerCase().indexOf(q) > -1) ||
               (item.content && item.content.toLowerCase().indexOf(q) > -1);
      }).slice(0, 10);
      if (this.results) {
        this.results.innerHTML = results.length === 0
          ? '<p style="text-align:center;color:var(--text-muted);padding:24px;">没有找到相关结果</p>'
          : results.map(function(item) {
              return '<a href="' + item.permalink + '" style="display:block;padding:12px 16px;border-radius:8px;margin-bottom:8px;"><h4 style="font-size:1rem;font-weight:600;color:var(--text-primary);margin-bottom:4px;">' + item.title + '</h4><p style="font-size:0.875rem;color:var(--text-tertiary);">' + (item.summary || '') + '</p></a>';
            }).join('');
      }
    }
  };

  // ==========================================
  // Calendar Widget
  // ==========================================
  var Calendar = {
    init: function() {
      var c = document.getElementById('calendar-widget');
      if (!c) return;
      var now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
      var fd = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
      var mn = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
      var dn = ['日','一','二','三','四','五','六'];
      var h = '<div style="text-align:center;margin-bottom:12px;font-weight:600;color:var(--text-primary);">' + y + '年' + mn[m] + '</div>';
      h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:0.8rem;">';
      dn.forEach(function(x) { h += '<div style="padding:4px;color:var(--text-muted);font-weight:500;">' + x + '</div>'; });
      for (var i = 0; i < fd; i++) h += '<div></div>';
      for (var day = 1; day <= dim; day++) {
        var s = day === d ? 'background:var(--accent-color);color:white;border-radius:50%;' : 'color:var(--text-secondary);';
        h += '<div style="padding:4px;' + s + '">' + day + '</div>';
      }
      h += '</div>';
      c.innerHTML = h;
    }
  };

  // ==========================================
  // Countdown Widget
  // ==========================================
  var Countdown = {
    init: function() {
      this.items = document.querySelectorAll('.countdown-item');
      if (!this.items.length) return;
      var self = this;
      this.update();
      setInterval(function() { self.update(); }, 60000);
    },
    update: function() {
      var now = new Date();
      this.items.forEach(function(item) {
        var diff = new Date(item.dataset.date) - now;
        var days = Math.max(0, Math.ceil(diff / 86400000));
        var el = item.querySelector('.countdown-days');
        if (el) el.textContent = days;
      });
    }
  };

  // ==========================================
  // Back to Top
  // ==========================================
  var BackToTop = {
    init: function() {
      this.btn = document.getElementById('back-to-top');
      if (!this.btn) return;
      var self = this;
      window.addEventListener('scroll', function() { self.btn.classList.toggle('visible', window.scrollY > 300); });
      this.btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  };

  // ==========================================
  // Header Scroll Effect
  // ==========================================
  var HeaderScroll = {
    init: function() {
      this.header = document.querySelector('.site-header');
      if (!this.header) return;
      var self = this;
      window.addEventListener('scroll', function() {
        self.header.classList.toggle('scrolled', window.scrollY > 100);
      });
    }
  };

  // ==========================================
  // Scroll Down Hint
  // ==========================================
  var ScrollDownHint = {
    init: function() {
      var hint = document.getElementById('scroll-down-hint');
      if (!hint) return;
      hint.addEventListener('click', function() {
        var banner = document.getElementById('site-banner');
        if (banner) window.scrollTo({ top: banner.offsetHeight, behavior: 'smooth' });
      });
    }
  };

  // ==========================================
  // Initialize all modules
  // ==========================================
  document.addEventListener('DOMContentLoaded', function() {
    HeaderScroll.init();
    BannerSlideshow.init();
    Typewriter.init();
    ThemeToggle.init();
    MobileMenu.init();
    Search.init();
    Calendar.init();
    Countdown.init();
    BackToTop.init();
    ScrollDownHint.init();
  });

})();
