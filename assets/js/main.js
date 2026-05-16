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
    TocHighlight.init();
    ArchiveCollapsible.init();
  });

})();
