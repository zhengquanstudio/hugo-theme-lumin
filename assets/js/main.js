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
      var q = (this.input ? this.input.value : '').trim();
      if (!q || !this.index) { if (this.results) this.results.innerHTML = ''; return; }
      var qLower = q.toLowerCase();
      var results = this.index.filter(function(item) {
        return (item.title && item.title.toLowerCase().indexOf(qLower) > -1) ||
               (item.content && item.content.toLowerCase().indexOf(qLower) > -1);
      }).slice(0, 10);
      if (this.results) {
        if (results.length === 0) {
          this.results.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px;">没有找到相关结果</p>';
          return;
        }
        var self = this;
        this.results.innerHTML = results.map(function(item) {
          return '<a href="' + item.permalink + '" style="display:block;padding:12px 16px;border-radius:8px;margin-bottom:8px;">' +
            '<h4 style="font-size:1rem;font-weight:600;color:var(--text-primary);margin-bottom:4px;">' + self.highlight(item.title, q) + '</h4>' +
            '<p style="font-size:0.875rem;color:var(--text-tertiary);">' + self.highlight(self.extractSnippet(item.content, q, 60), q) + '</p></a>';
        }).join('');
      }
    },

    highlight: function(text, keyword) {
      if (!text || !keyword) return text || '';
      try {
        var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(re, '<mark class="search-highlight">$1</mark>');
      } catch(e) { return text; }
    },

    extractSnippet: function(text, keyword, maxLen) {
      if (!text) return '';
      var lower = text.toLowerCase();
      var idx = lower.indexOf(keyword.toLowerCase());
      if (idx === -1) return text.substring(0, maxLen).trim() + '...';
      var start = Math.max(0, idx - Math.floor(maxLen / 2));
      var end = Math.min(text.length, start + maxLen);
      var snippet = text.substring(start, end).trim();
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      return snippet;
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

      // 周数计算
      var startOfYear = new Date(y, 0, 1);
      var pastDays = Math.floor((now - startOfYear) / 86400000);
      var weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
      var dayOfYear = pastDays + 1;

      // 农历数据（简化版，覆盖常用范围）
      var lunarInfo = [
        0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
        0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
        0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
        0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
        0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
        0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
        0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
        0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
        0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
        0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
        0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
        0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
        0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
        0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
        0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
      ];
      var lunarMonth = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
      var lunarDay = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
                      '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                      '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
      var tianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
      var diZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      var shengXiao = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
      function getLunar(y, m, d) {
        var baseDate = new Date(1900, 0, 31);
        var offset = Math.floor((new Date(y, m, d) - baseDate) / 86400000);
        var lunarYear = 1900, temp = 0;
        for (var i = 1900; i < 2100 && offset > 0; i++) { temp = getLunarYearDays(i); offset -= temp; if (offset <= 0) { offset += temp; break; } lunarYear++; }
        var leapMonth = getLeapMonth(lunarYear), isLeap = false;
        for (var j = 1; j < 13 && offset > 0; j++) {
          if (j === leapMonth + 1 && !isLeap) { --j; isLeap = true; temp = getLeapDays(lunarYear); } else { temp = getLunarMonthDays(lunarYear, j); }
          if (offset > temp) { offset -= temp; if (!isLeap) leapMonth = 0; } else { if (isLeap) leapMonth = j; break; }
        }
        var lm = isLeap ? '闰' + lunarMonth[leapMonth || j - 1] : lunarMonth[j - 1], ld = lunarDay[offset - 1];
        var gzYear = (lunarYear - 4) % 10, gzYue = (lunarYear - 4 + j) % 10, gzRi = (lunarYear - 4 + offset) % 10;
        var dzYear = (lunarYear - 4) % 12, dzYue = (lunarYear - 4 + j) % 12, dzRi = (lunarYear - 4 + offset) % 12;
        return {month: lm, day: ld, year: tianGan[gzYear] + diZhi[dzYear], animal: shengXiao[dzYear]};
      }
      function lYearDays(y) { var sum = 348; for (var i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0; return sum + leapDays(y); }
      function leapDays(y) { if (leapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29; return 0; }
      function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
      function getLunarYearDays(y) { var days = 348; for (var i = 0x8000; i > 0x8; i >>= 1) days += (lunarInfo[y - 1900] & i) ? 1 : 0; return days + leapDays(y); }
      function getLeapDays(y) { if (getLeapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29; return 0; }
      function getLeapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
      function getLunarMonthDays(y, m) { return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29; }

      var lunar = getLunar(y, m, d);

      var h = '';
      h += '<div class="cal-body">';
      /* 左侧：日期信息 */
      h += '<div class="cal-left">';
      h += '<div class="cal-top"><span class="cal-week-num">第' + weekNum + '周</span><span class="cal-weekday">周日</span></div>';
      h += '<div class="cal-center"><div class="cal-day">' + d + '</div></div>';
      h += '<div class="cal-bottom">';
      h += '<div class="cal-info">' + y + '年' + (m + 1) + '月 第' + dayOfYear + '天</div>';
      h += '<div class="cal-lunar">' + lunar.year + lunar.animal + '年 ' + lunar.month + '月 ' + lunar.day + '</div>';
      h += '</div></div>';
      /* 右侧：月历 */
      h += '<div class="cal-divider"></div>';
      h += '<div class="cal-right">';
      h += '<table class="cal-grid"><thead><tr>';
      dn.forEach(function(x) { h += '<th>' + x + '</th>'; });
      h += '</tr></thead><tbody><tr>';
      for (var i = 0; i < fd; i++) h += '<td class="cal-empty"></td>';
      for (var day = 1; day <= dim; day++) {
        var cls = '';
        if (day === d) cls = ' cal-today';
        h += '<td class="cal-cell' + cls + '">' + day + '</td>';
        if ((fd + day) % 7 === 0 && day < dim) h += '</tr><tr>';
      }
      h += '</td></tr></tbody></table></div></div>';

      c.innerHTML = h;
    }
  };

  // ==========================================
  // Visitor IP Widget
  // ==========================================
  var Visitor = {
    init: function() {
      var el = document.getElementById('visitor-widget');
      if (!el) return;
      this.fetchIP(el);
    },
    fetchIP: function(el) {
      var self = this;
      try {
        fetch('https://ipapi.co/json/')
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.ip) {
              var city = data.city || '';
              var region = data.region || '';
              var country = data.country_name || data.country || '';
              var locArr = [country, region, city].filter(Boolean);
              var locationStr = locArr.length > 0 ? '来自：' + locArr.join(' · ') : '';
              el.innerHTML =
                '<div class="visitor-welcome">欢迎访问我的博客</div>' +
                '<div class="visitor-ip">' + data.ip + '</div>' +
                '<div class="visitor-location">' + locationStr + '</div>';
            } else {
              self.showError(el);
            }
          })
          .catch(function() { self.fallback(el); });
      } catch(e) { self.fallback(el); }
    },
    fallback: function(el) {
      var self = this;
      try {
        fetch('http://ip-api.com/json/?lang=zh-CN', { mode: 'cors' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.status === 'success') {
              var city = data.city || '';
              var region = data.province || data.regionName || '';
              var country = data.country || '';
              var isp = data.isp || '';
              var locArr = [country, region, city, isp].filter(Boolean);
              var locationStr = locArr.length > 0 ? '来自：' + locArr.join(' · ') : '';
              el.innerHTML =
                '<div class="visitor-welcome">欢迎访问我的博客</div>' +
                '<div class="visitor-ip">' + data.query + '</div>' +
                '<div class="visitor-location">' + locationStr + '</div>';
            } else {
              self.showError(el);
            }
          })
          .catch(function() { self.showError(el); });
      } catch(e) { self.showError(el); }
    },
    showError: function(el) {
      el.innerHTML =
        '<div class="visitor-welcome">欢迎访问我的博客</div>' +
        '<div class="visitor-location">无法获取访客信息</div>';
    }
  };

  // ==========================================
  // Countdown Widget
  // ==========================================
  var Countdown = {
    init: function() {
      var el = document.getElementById('countdown-widget');
      if (!el) return;
      this.renderProgress();
      this.updateEvent();
      var self = this;
      setInterval(function() { self.updateEvent(); }, 60000);
    },
    renderProgress: function() {
      var now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
      /* 本年进度 */
      var yearStart = new Date(y, 0, 1), yearEnd = new Date(y + 1, 0, 1);
      var yearTotal = Math.ceil((yearEnd - yearStart) / 86400000);
      var yearPassed = Math.floor((now - yearStart) / 86400000) + 1;
      var yearLeft = yearTotal - yearPassed, yearPct = Math.round(yearPassed / yearTotal * 100);
      /* 本月进度 */
      var monthStart = new Date(y, m, 1), monthEnd = new Date(y, m + 1, 0);
      var monthTotal = monthEnd.getDate();
      var monthPassed = d, monthLeft = monthTotal - d, monthPct = Math.round(d / monthTotal * 100);
      /* 本周进度 (周一为起始日) */
      var dow = now.getDay() || 7; /* 周一=1 ... 周日=7 */
      var weekPassed = dow, weekLeft = 7 - dow, weekPct = Math.round(dow / 7 * 100);

      var pEl = document.getElementById('cd-progress');
      if (!pEl) return;
      pEl.innerHTML =
        this.barHTML(yearPct, '本年还剩' + yearLeft + '天') +
        this.barHTML(monthPct, '本月还剩' + monthLeft + '天') +
        this.barHTML(weekPct, '本周还剩' + weekLeft + '天');
    },
    barHTML: function(pct, label) {
      return '<div class="cd-progress-row">' +
        '<div class="cd-bar-header"><span class="cd-pct">' + pct + '%</span><span class="cd-label">' + label + '</span></div>' +
        '<div class="cd-bar-track"><div class="cd-bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
    },
    updateEvent: function() {
      var el = document.querySelector('.countdown-event');
      if (!el) return;
      var target = new Date(el.dataset.date);
      if (isNaN(target.getTime())) return;
      var diff = Math.max(0, Math.ceil((target - new Date()) / 86400000));
      var daysEl = el.querySelector('.countdown-event-days');
      if (daysEl) daysEl.textContent = diff;
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
  // Header Clock
  // ==========================================
  var HeaderClock = {
    init: function() {
      this.clock = document.getElementById('header-clock');
      if (!this.clock) return;
      this.update();
      setInterval(function() { HeaderClock.update(); }, 1000);
    },
    update: function() {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      var s = String(now.getSeconds()).padStart(2, '0');
      if (this.clock) this.clock.textContent = h + ':' + m + ':' + s;
    }
  };

  // ==========================================
  // TocCollapsible - 目录子级折叠
  // ==========================================
  var TocCollapsible = {
    init: function() {
      this.tocNav = document.getElementById('toc-nav');
      if (!this.tocNav) return;

      // 找到所有有子级 ul 的 li，插入折叠按钮
      var items = this.tocNav.querySelectorAll('li');
      var self = this;
      items.forEach(function(li) {
        var childUl = li.querySelector(':scope > ul');
        if (!childUl) return;

        // 在第一个 a 或文本前插入折叠按钮
        var firstChild = li.firstChild;
        var toggle = document.createElement('span');
        toggle.className = 'toc-toggle expanded';
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-label', '折叠目录');

        if (firstChild && (firstChild.nodeType === 1 || (firstChild.nodeType === 3 && !firstChild.textContent.trim()))) {
          li.insertBefore(toggle, firstChild);
        } else {
          li.prepend(toggle);
        }

        // 记录原始高度用于动画
        childUl.dataset.naturalHeight = childUl.scrollHeight + 'px';

        // 点击切换
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          self.toggleItem(toggle, childUl);
        });
      });

      // 默认折叠所有二级以上子菜单（保留一级展开）
      this.autoCollapse();
    },

    toggleItem: function(toggle, ul) {
      var isExpanded = toggle.classList.contains('expanded');
      if (isExpanded) {
        ul.style.maxHeight = ul.scrollHeight + 'px';
        requestAnimationFrame(function() {
          ul.classList.add('collapsed');
          ul.style.maxHeight = '0';
        });
        toggle.classList.remove('expanded');
        toggle.setAttribute('aria-label', '展开目录');
      } else {
        ul.style.maxHeight = '0';
        ul.classList.remove('collapsed');
        ul.style.maxHeight = ul.scrollHeight + 'px';
        toggle.classList.add('expanded');
        toggle.setAttribute('aria-label', '折叠目录');
        // 动画结束后清除内联 max-height，让 CSS 接管
        var self = this;
        setTimeout(function() { if (!ul.classList.contains('collapsed')) ul.style.maxHeight = ''; }, 320);
      }
    },

    autoCollapse: function() {
      // 折叠所有二级及以上子菜单（> ul > li > ul）
      var subUls = this.tocNav.querySelectorAll('ul ul');
      var self = this;
      subUls.forEach(function(ul) {
        var parentLi = ul.parentElement;
        var toggle = parentLi.querySelector('.toc-toggle');
        if (toggle && toggle.classList.contains('expanded')) {
          self.toggleItem(toggle, ul);
        }
      });
    }
  };

  // ==========================================
  // TOC Scroll Highlight - 目录滚动高亮
  // ==========================================
  var TocHighlight = {
    init: function() {
      this.tocNav = document.getElementById('toc-nav');
      if (!this.tocNav) return;

      this.tocLinks = this.tocNav.querySelectorAll('a[href^="#"]');
      if (!this.tocLinks.length) return;

      this.headings = [];
      var self = this;
      this.tocLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        // 跳过空链接或纯 # 链接
        if (!href || href === '#' || href.length < 2) return;

        var id = href.slice(1); // 去掉 #
        var heading = null;

        // 方案1：直接用 getElementById（最可靠）
        heading = document.getElementById(id);

        // 方案2：如果方案1失败，尝试 CSS.escape + querySelector（兼容特殊字符ID）
        if (!heading && typeof CSS !== 'undefined' && CSS.escape) {
          try { heading = document.querySelector('#' + CSS.escape(id)); } catch(e) {}
        }

        // 方案3：最后尝试直接拼接（不转义，部分浏览器支持中文ID）
        if (!heading) {
          try { heading = document.querySelector(href); } catch(e) {}
        }

        if (heading) self.headings.push({ el: heading, link: link, id: id });
      });

      if (!this.headings.length) return;

      this.activeIndex = -1;
      this.offset = 120; // 标题进入视口上方此距离即触发

      // 使用 passive 提升滚动性能
      window.addEventListener('scroll', function() { self.update(); }, { passive: true });

      // 延迟执行首次更新，确保所有布局已完成
      requestAnimationFrame(function() { self.update(); });
    },

    update: function() {
      var scrollTop = window.scrollY || window.pageYOffset;
      var currentIndex = -1;

      for (var i = this.headings.length - 1; i >= 0; i--) {
        var rect = this.headings[i].el.getBoundingClientRect();
        if (rect.top <= this.offset) {
          currentIndex = i;
          break;
        }
      }

      // 页面顶部时清除所有高亮
      if (scrollTop < 100) currentIndex = -1;

      if (currentIndex === this.activeIndex) return;
      this.activeIndex = currentIndex;

      // 移除所有 active 类
      var self = this;
      this.tocLinks.forEach(function(link) { link.classList.remove('active'); });

      // 给当前项添加 active
      if (currentIndex >= 0 && this.headings[currentIndex]) {
        this.headings[currentIndex].link.classList.add('active');

        // 自动滚动 TOC 让当前项可见
        this.scrollTocIntoView(this.headings[currentIndex].link);
      }
    },

    scrollTocIntoView: function(linkEl) {
      var container = this.tocNav;
      var linkRect = linkEl.getBoundingClientRect();
      var containerRect = container.getBoundingClientRect();

      // 如果当前项不在可视区域内，平滑滚动到可见位置
      if (linkRect.bottom > containerRect.bottom || linkRect.top < containerRect.top) {
        var offsetTop = linkEl.offsetTop - container.offsetTop - (container.offsetHeight / 2) + (linkEl.offsetHeight / 2);
        container.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  };

  // ==========================================
  // Mobile Category Dropdown - 移动端分类折叠
  // ==========================================
  var MobileCategory = {
    init: function() {
      var toggles = document.querySelectorAll('.mobile-nav-toggle');
      if (!toggles.length) return;
      toggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          var parent = this.closest('.mobile-nav-item');
          if (parent) parent.classList.toggle('active');
        });
      });
    }
  };

  // ==========================================
  // Archive Collapsible - 归档页年份/月份折叠
  // ==========================================
  var ArchiveCollapsible = {
    init: function() {
      var container = document.getElementById('archives-timeline');
      if (!container) return;

      var self = this;

      // 年份标题点击
      container.querySelectorAll('.archive-year-header[data-toggle="year"]').forEach(function(title) {
        title.addEventListener('click', function() {
          var yearEl = this.closest('.archive-year');
          if (yearEl) yearEl.classList.toggle('collapsed');
          self.updateHeight(yearEl.querySelector('.archive-year-content'));
        });
      });

      // 月份标题点击
      container.querySelectorAll('.archive-month-header[data-toggle="month"]').forEach(function(title) {
        title.addEventListener('click', function(e) {
          e.stopPropagation(); // 防止触发年份折叠
          var monthEl = this.closest('.archive-month');
          if (monthEl) monthEl.classList.toggle('collapsed');
          self.updateHeight(monthEl.querySelector('.archive-month-content'));
        });
      });

      // 默认展开最近一年，其余折叠
      this.autoCollapse();
    },

    updateHeight: function(el) {
      if (!el) return;
      var isCollapsed = el.parentElement.classList.contains('collapsed');
      if (isCollapsed) {
        el.style.maxHeight = '0';
        el.style.opacity = '0';
      } else {
        // 先临时设为 auto 以获取真实高度，再设回
        el.style.maxHeight = 'none';
        el.style.opacity = '1';
        var h = el.scrollHeight;
        el.style.maxHeight = h + 'px';
        // 动画结束后清除内联样式，让 CSS transition 接管（可选）
        var self = this;
        setTimeout(function() {
          if (!el.parentElement.classList.contains('collapsed')) {
            el.style.maxHeight = 'none';
          }
        }, 360);
      }
    },

    autoCollapse: function() {
      var years = document.querySelectorAll('.archive-year.archive-collapsible');
      if (!years.length) return;

      var self = this;

      years.forEach(function(year) {
        if (year.classList.contains('collapsed')) {
          var content = year.querySelector('.archive-year-content');
          if (content) {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
          }
        } else {
          var content = year.querySelector('.archive-year-content');
          if (content) {
            content.style.maxHeight = 'none';
            content.style.opacity = '1';
          }
        }

        // 初始化月份折叠状态
        year.querySelectorAll('.archive-month').forEach(function(month) {
          var mContent = month.querySelector('.archive-month-content');
          if (!mContent) return;
          if (month.classList.contains('collapsed')) {
            mContent.style.maxHeight = '0';
            mContent.style.opacity = '0';
          } else {
            mContent.style.maxHeight = 'none';
            mContent.style.opacity = '1';
          }
        });
      });
    }
  };

  // ==========================================
  // ==========================================
  // CodeBlock - 代码块复制按钮 + 折叠/展开
  // ==========================================
  var CodeBlock = {
    MAX_HEIGHT: 300, // 超过此高度自动折叠

    init: function() {
      var blocks = document.querySelectorAll('.post-content pre');
      if (!blocks.length) return;

      blocks.forEach(function(pre) {
        var codeEl = pre.querySelector('code');
        if (!codeEl) return;
        if (pre.closest('.code-wrapper')) return; // 已处理过

        // 创建包装器
        var wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // ====== 工具栏（右上角：折叠 + 复制）======
        var toolbar = document.createElement('div');
        toolbar.className = 'code-toolbar';

        // 折叠/展开按钮（仅高度超限时显示）
        var toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'code-toggle-btn';
        toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
        toggleBtn.innerHTML =
          '<svg class="toggle-icon-collapse" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 20 16 14"/><line x1="20" y1="4" x2="12.01" y2="12"/></svg>' +
          '<span>\u6298\u53e0</span>';

        // 复制按钮
        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'code-copy-btn';
        copyBtn.setAttribute('aria-label', '\u590d\u5236\u4ee3\u7801');
        copyBtn.innerHTML =
          '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          '<svg class="check-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<span class="copy-text">Copy</span>';

        toolbar.appendChild(toggleBtn);
        toolbar.appendChild(copyBtn);
        wrapper.appendChild(toolbar);

        // 底部"查看更多"
        var expandBar = document.createElement('div');
        expandBar.className = 'code-expand-bar';
        expandBar.style.display = 'none'; // 默认隐藏
        var expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
          '<span>\u67e5\u770b\u5168\u90e8</span>';
        expandBar.appendChild(expandBtn);
        wrapper.appendChild(expandBar);

        // ====== 判断是否需要折叠（渲染后测量实际高度）======
        requestAnimationFrame(function() {
          var actualHeight = pre.scrollHeight;
          if (actualHeight > CodeBlock.MAX_HEIGHT) {
            wrapper.classList.add('collapsed');
            expandBar.style.display = 'flex';
            toggleBtn.style.display = 'inline-flex';
          } else {
            // 短代码块：隐藏折叠按钮
            toggleBtn.style.display = 'none';
          }
        });

        // ====== 折叠/展开切换 ======
        toggleBtn.addEventListener('click', function() {
          var isCollapsed = wrapper.classList.contains('collapsed');
          if (isCollapsed) {
            // 展开全部
            wrapper.classList.remove('collapsed');
            wrapper.classList.add('expanded');
            expandBar.style.display = 'none';
            toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
            toggleBtn.innerHTML =
              '<svg class="toggle-icon-expand" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 10 12 4 6 10"/><line x1="4" y1="20" x2="11.99" y2="12"/></svg>' +
              '<span>\u6298\u53e0</span>';
          } else {
            // 折叠
            wrapper.classList.remove('expanded');
            wrapper.classList.add('collapsed');
            expandBar.style.display = 'flex';
            toggleBtn.setAttribute('aria-label', '\u5c55\u5f00\u4ee3\u7801\u5757');
            toggleBtn.innerHTML =
              '<svg class="toggle-icon-collapse" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 20 16 14"/><line x1="20" y1="4" x2="12.01" y2="12"/></svg>' +
              '<span>\u6298\u53e0</span>';
          }
        });

        // ====== 底部"查看更多"按钮 ======
        expandBtn.addEventListener('click', function() {
          wrapper.classList.remove('collapsed');
          wrapper.classList.add('expanded');
          expandBar.style.display = 'none';
          toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
          toggleBtn.innerHTML =
            '<svg class="toggle-icon-expand" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 10 12 4 6 10"/><line x1="4" y1="20" x2="11.99" y2="12"/></svg>' +
            '<span>\u6298\u53e0</span>';
        });

        // ====== 复制功能 ======
        copyBtn.addEventListener('click', function() {
          var text = codeEl.textContent || '';
          navigator.clipboard.writeText(text).then(function() {
            copyBtn.classList.add('copied');
            setTimeout(function() { copyBtn.classList.remove('copied'); }, 2000);
          }).catch(function() {});
        });
      });
    }
  };

  // ==========================================
  // Reading Progress Bar - 阅读进度条
  // ==========================================
  var ReadingProgress = {
    init: function() {
      this.bar = document.getElementById('reading-progress');
      this.fill = document.querySelector('.reading-progress-fill');
      if (!this.bar || !this.fill) return;

      this.article = document.querySelector('.single-post');
      if (!this.article) return;

      var self = this;
      window.addEventListener('scroll', function() { self.update(); }, { passive: true });
      this.update();
    },

    update: function() {
      if (!this.article || !this.fill) return;
      var articleRect = this.article.getBoundingClientRect();
      var articleTop = articleRect.top + window.scrollY;
      var articleHeight = this.article.offsetHeight;
      var windowHeight = window.innerHeight;
      // 进度 = 已滚过文章内容的比例（顶部露出到完全离开视口）
      var scrolled = Math.max(0, window.scrollY - articleTop + windowHeight * 0.3);
      var total = articleHeight - windowHeight * 0.3;
      var progress = Math.min(100, Math.max(0, (scrolled / total) * 100));
      this.fill.style.width = progress.toFixed(2) + '%';
    }
  };

  // ==========================================
  // FriendLinkCheck - 友链失效自动检测
  // ==========================================
  var FriendLinkCheck = {
    TIMEOUT: 8000,       // 单个链接检测超时(ms)
    CONCURRENT: 3,       // 并发检测数
    RETRY_DELAY: 1000,   // 重试延迟(ms)

    init: function() {
      this.grid = document.querySelector('.friends-grid');
      if (!this.grid) return;

      this.cards = this.grid.querySelectorAll('.friend-card');
      if (!this.cards.length) return;

      // 创建状态栏
      this.createStatusBar();

      // 开始检测
      var self = this;
      setTimeout(function() { self.startCheck(); }, 500); // 延迟等待页面完全渲染
    },

    createStatusBar: function() {
      var bar = document.createElement('div');
      bar.className = 'friend-check-statusbar';
      bar.id = 'friend-check-status';
      bar.innerHTML =
        '<div class="check-status-inner">' +
          '<span class="check-icon checking"><i class="fas fa-circle-notch fa-spin"></i></span>' +
          '<span class="check-text">正在检测友链可用性...</span>' +
          '<span class="check-progress"></span>' +
          '<button class="check-retry-btn" style="display:none;" onclick="FriendLinkCheck.retryAll()"><i class="fas fa-redo"></i> 重新检测</button>' +
        '</div>';
      this.grid.parentNode.insertBefore(bar, this.grid);
      this.statusBar = bar;
    },

    startCheck: function() {
      this.results = { total: this.cards.length, ok: 0, fail: 0, checked: 0 };
      this.queue = Array.prototype.slice.call(this.cards);
      this.updateProgress();

      // 并发执行检测
      this.processQueue();
    },

    processQueue: function() {
      var self = this;
      while (this.running < this.CONCURRENT && this.queue.length > 0) {
        var card = this.queue.shift();
        this.running = (this.running || 0) + 1;
        this.checkCard(card);
      }
    },

    checkCard: function(card) {
      var url = card.getAttribute('href');
      if (!url || url === '#' || !url.match(/^https?:\/\//)) {
        this.markResult(card, 'skip', null);
        return;
      }

      var self = this;
      var controller = new AbortController();
      var timer = setTimeout(function() { controller.abort(); }, this.TIMEOUT);

      // 使用 no-cors 模式探测（不读取响应体，只判断网络层是否可达）
      var startTime = Date.now();
      fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      }).then(function() {
        clearTimeout(timer);
        var elapsed = Date.now() - startTime;
        self.markResult(card, elapsed <= self.TIMEOUT ? 'ok' : 'slow', elapsed);
      }).catch(function(err) {
        clearTimeout(timer);
        // TypeError 通常表示网络错误(DNS失败/连接超时/SSL错误)
        // AbortError 表示超时
        var isFail = err.name === 'TypeError' || err.name === 'AbortError';
        self.markResult(card, isFail ? 'fail' : 'unknown', null);
      });
    },

    markResult: function(card, status, timeMs) {
      // 移除旧状态
      card.classList.remove('friend-ok', 'friend-fail', 'friend-checking', 'friend-skip');

      var badge = card.querySelector('.friend-status-badge');
      if (badge) badge.remove();

      if (status === 'ok') {
        card.classList.add('friend-ok');
        this.results.ok++;
      } else if (status === 'fail') {
        card.classList.add('friend-fail');
        // 添加失效标签
        var b = document.createElement('span');
        b.className = 'friend-status-badge fail';
        b.innerHTML = '<i class="fas fa-unlink"></i> 失效';
        b.title = '该链接无法访问，可能是网站已关闭或域名过期';
        card.appendChild(b);
        this.results.fail++;
      } else if (status === 'skip') {
        card.classList.add('friend-skip');
      }

      this.results.checked++;
      this.running--;
      this.updateProgress();

      // 继续处理队列
      if (this.queue.length > 0) {
        this.processQueue();
      } else if (this.running <= 0) {
        this.finishCheck();
      }
    },

    updateProgress: function() {
      if (!this.statusBar) return;
      var textEl = this.statusBar.querySelector('.check-text');
      var progEl = this.statusBar.querySelector('.check-progress');
      var iconEl = this.statusBar.querySelector('.check-icon');
      var retryBtn = this.statusBar.querySelector('.check-retry-btn');

      if (textEl) {
        if (this.results.checked < this.results.total) {
          textEl.textContent = '正在检测友链可用性... (' + this.results.checked + '/' + this.results.total + ')';
        }
      }
      if (progEl) {
        var pct = Math.round(this.results.checked / this.results.total * 100);
        progEl.style.width = pct + '%';
        progEl.textContent = pct + '%';
      }
    },

    finishCheck: function() {
      if (!this.statusBar) return;
      var textEl = this.statusBar.querySelector('.check-text');
      var iconEl = this.statusBar.querySelector('.check-icon i');
      var retryBtn = this.statusBar.querySelector('.check-retry-btn');

      // 更新状态文本
      var summary = '';
      if (this.results.fail === 0) {
        summary = '全部 ' + this.results.total + ' 个友链均正常访问 ✓';
        if (iconEl) {
          iconEl.className = 'fas fa-check-circle ok';
          iconEl.classList.remove('fa-spin');
        }
        this.statusBar.classList.add('all-ok');
      } else {
        summary = '检测完成：' + this.results.ok + ' 个正常，' + this.results.fail + ' 个可能失效';
        if (iconEl) {
          iconEl.className = 'fas fa-exclamation-triangle warn';
          iconEl.classList.remove('fa-spin');
        }
        this.statusBar.classList.add('has-fail');
        if (retryBtn) retryBtn.style.display = 'inline-flex';
      }
      if (textEl) textEl.textContent = summary;

      // 回填数据到侧边栏"站点统计"组件
      this.updateSidebarStats();
    },

    updateSidebarStats: function() {
      var statRow = document.getElementById('stats-friend-links');
      if (!statRow) return;

      statRow.style.display = '';
      var totalEl = document.getElementById('friend-link-total');
      var failBadge = document.getElementById('friend-link-fail-badge');
      var failCountEl = document.getElementById('friend-link-fail-count');

      if (totalEl) totalEl.textContent = this.results.ok;

      if (this.results.fail > 0 && failBadge && failCountEl) {
        failBadge.style.display = 'inline-flex';
        failCountEl.textContent = this.results.fail;
      } else if (failBadge) {
        failBadge.style.display = 'none';
      }
    },

    retryAll: function() {
      // 清除之前的状态
      var self = this;
      this.cards.forEach(function(card) {
        card.classList.remove('friend-ok', 'friend-fail', 'friend-skip', 'friend-checking');
        var badge = card.querySelector('.friend-status-badge');
        if (badge) badge.remove();
      });

      // 重置状态栏
      if (this.statusBar) {
        this.statusBar.classList.remove('all-ok', 'has-fail');
        var iconEl = this.statusBar.querySelector('.check-icon i');
        var textEl = this.statusBar.querySelector('.check-text');
        var retryBtn = this.statusBar.querySelector('.check-retry-btn');
        if (iconEl) { iconEl.className = 'fas fa-circle-notch fa-spin'; }
        if (textEl) textEl.textContent = '正在重新检测...';
        if (retryBtn) retryBtn.style.display = 'none';
      }

      // 重新开始
      this.running = 0;
      this.startCheck();
    }
  };

  // Initialize all modules
  // ==========================================
  document.addEventListener('DOMContentLoaded', function() {
    HeaderScroll.init();
    HeaderClock.init();
    BannerSlideshow.init();
    Typewriter.init();
    ThemeToggle.init();
    MobileMenu.init();
    MobileCategory.init();
    Search.init();
    Calendar.init();
    Visitor.init();
    Countdown.init();
    BackToTop.init();
    ScrollDownHint.init();
    TocCollapsible.init();
    TocHighlight.init();
    ArchiveCollapsible.init();
    CodeBlock.init();
    ReadingProgress.init();
    FriendLinkCheck.init();
  });

})();
