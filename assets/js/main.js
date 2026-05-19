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
  // Banner Slideshow - 背景图轮播（丝滑淡入淡出版）
  // ==========================================
  var BannerSlideshow = (function() {
    var slides, total, current, interval, timer, randomMode;
    var transitioning = false;

    function switchTo(index) {
      if (!slides || index < 0 || index >= total || transitioning) return;

      transitioning = true;
      var prevIndex = current;
      current = index;

      var prev = slides[prevIndex];
      var next = slides[index];

      for (var i = 0; i < total; i++) {
        if (i !== prevIndex && i !== index) {
          slides[i].classList.remove('active');
          slides[i].style.cssText = 'opacity:0;z-index:0;position:absolute;inset:0;';
        }
      }

      next.classList.add('active');
      next.style.cssText = 'opacity:0;z-index:1;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
      void next.offsetHeight;

      prev.style.cssText = 'opacity:0;z-index:2;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
      next.style.cssText = 'opacity:1;z-index:1;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';

      console.log('[Banner] 🔄 ' + (prevIndex+1) + '→' + (index+1) + '/' + total);

      setTimeout(function() {
        prev.classList.remove('active');
        prev.style.cssText = 'opacity:0;z-index:0;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
        next.style.cssText = 'opacity:1;z-index:2;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
        transitioning = false;
      }, 1300);
    }

    function next() {
      if (!slides || total < 2 || transitioning) return;
      switchTo((current + 1) % total);
    }

    function init() {
      slides = document.querySelectorAll('.banner-slide');
      if (!slides || !slides.length) { console.warn('[Banner] 未找到 .banner-slide'); return; }

      total = slides.length;
      current = 0;
      transitioning = false;

      try {
        var cfg = getBannerConfig();
        interval = Math.max(3000, (cfg.interval || 5000));
        randomMode = (cfg.randomMode === true);
      } catch(e) { interval = 5000; randomMode = false; }

      console.log('[Banner] ✓ 初始化: ' + total + ' 张, 间隔=' + interval + 'ms');

      for (var k = 0; k < total; k++) {
        slides[k].style.cssText = 'position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
      }

      var imgs = document.querySelectorAll('.banner-slide-image');
      for (var j = 0; j < imgs.length; j++) {
        if (imgs[j].src) new Image().src = imgs[j].src;
      }

      if (randomMode && total > 1) {
        var rnd = Math.floor(Math.random() * total);
        console.log('[Banner] 🎲 随机选择第 ' + (rnd + 1) + ' 张');
        slides[rnd].classList.add('active');
        slides[rnd].style.opacity = '1';
        slides[rnd].style.zIndex = '2';
        current = rnd;
      } else {
        slides[0].classList.add('active');
        slides[0].style.opacity = '1';
        slides[0].style.zIndex = '2';
      }

      if (total >= 2) {
        if (timer) clearInterval(timer);
        timer = setInterval(next, interval);
        console.log('[Banner] ⏱️ 轮播已启动 (' + interval + 'ms, 淡入淡出1.2s)');
      }
    }

    return { init: init };
  })();

  // ==========================================
  // Typewriter Effect - 打字机效果（API优先 + 本地降级版）
  // ==========================================
  var Typewriter = (function() {
    var el, texts, textIdx, charIdx, isDel, typeSpd, delSpd, pauseTmr, typeTmr;
    var apiEnabled = false;
    var apiUrls = [
      'https://v1.hitokoto.cn/?c=d&c=h&c=i&c=k&encode=text',
      'https://api.shadiao.pro/chp/api',
      'https://api.oick.cn/yiyan/api.php'
    ];
    var localTexts = [];

    function getConfig() {
      try {
        if (window.LUMIN_BANNER) return window.LUMIN_BANNER;
      } catch(e) {}
      try {
        var cfgEl = document.getElementById('banner-config');
        if (cfgEl) return JSON.parse(cfgEl.textContent);
      } catch(e) {}
      return {};
    }

    function fetchFromApi(callback) {
      if (!apiEnabled || apiUrls.length === 0) { callback(false); return; }

      var url = apiUrls.shift();
      console.log('[Typewriter] 🌐 尝试 API: ' + (url||'').substring(0,50));

      try {
        fetch(url, { mode: 'cors', signal: AbortSignal.timeout(3000) })
          .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
          })
          .then(function(text) {
            text = text.trim();
            if (text && text.length > 2 && text.length < 200) {
              console.log('%c[Typewriter] ✓ API 成功: "' + text.substring(0,25) + '"', 'color:#059669');
              callback(true, text);
            } else {
              throw new Error('内容异常');
            }
          })
          .catch(function(err) {
            console.warn('[Typewriter] ⚠️ API 失败: ' + err.message);
            if (apiUrls.length > 0) {
              fetchFromApi(callback);
            } else {
              callback(false);
            }
          });
      } catch(e) {
        callback(false);
      }
    }

    function fetchMultiple(count, callback) {
      var results = [];
      var self = arguments.callee;

      fetchFromApi(function(success, text) {
        if (success && text) results.push(text);
        if (results.length >= count || !apiEnabled || apiUrls.length === 0) {
          callback(results);
        } else {
          self(count, callback, results);
        }
      });
    }

    function start() {
      el = document.getElementById('typewriter-text');
      if (!el) { console.warn('[Typewriter] #typewriter-text 未找到'); return; }

      var cfg = getConfig();
      typeSpd = (cfg.typingSpeed || 100);
      delSpd = (cfg.deletingSpeed || 50);
      pauseTmr = (cfg.pauseTime || 2000);

      localTexts = cfg.subtitles || [];
      if (!localTexts.length || !localTexts[0]) {
        localTexts = ['明心见性，爱自己', '记录生活，分享技术', '每一天都是新的开始', '用心感悟，用爱生活'];
      }

      apiEnabled = (cfg.apiEnabled === true);

      if (apiEnabled) {
        console.log('[Typewriter] 🚀 API 模式已启用，正在获取句子...');
        fetchMultiple(3, function(apiTexts) {
          if (apiTexts.length > 0) {
            texts = apiTexts.concat(localTexts);
            console.log('%c[Typewriter] ✓ 获取到 ' + apiTexts.length + ' 条API文本 + ' + localTexts.length + ' 条本地备用', 'color:#059669;font-weight:bold');
          } else {
            texts = localTexts;
            console.warn('[Typewriter] ⚠️ 所有API均失败，使用本地配置 (' + texts.length + ' 条)');
          }
          console.log('[Typewriter] 文本列表: ' + JSON.stringify(texts));
          textIdx = 0; charIdx = 0; isDel = false;
          tick();
        });
      } else {
        texts = localTexts;
        console.log('[Typewriter] ✓ 本地模式，共 ' + texts.length + ' 条: ' + JSON.stringify(texts));
        textIdx = 0; charIdx = 0; isDel = false;
        tick();
      }
    }

    function tick() {
      if (!el) return;
      var txt = texts[textIdx % texts.length];

      if (isDel) {
        charIdx--;
        el.textContent = txt.substring(0, charIdx);
        if (charIdx <= 0) {
          isDel = false;
          textIdx++;
          if (apiEnabled && textIdx % texts.length === 0) {
            fetchFromApi(function(ok, newText) {
              if (ok && newText) { texts.push(newText); }
              typeTmr = setTimeout(tick, 300);
            });
          } else {
            typeTmr = setTimeout(tick, 300);
          }
        } else {
          typeTmr = setTimeout(tick, delSpd);
        }
      } else {
        charIdx++;
        el.textContent = txt.substring(0, charIdx);
        if (charIdx >= txt.length) {
          isDel = true;
          typeTmr = setTimeout(tick, pauseTmr);
        } else {
          typeTmr = setTimeout(tick, typeSpd);
        }
      }
    }

    return { init: start };
  })();

  // ==========================================
  // ThemeToggle - 主题切换（毛玻璃柔和版 v3）
  // 支持: ripple(水波) / diagonal(对角线) / blinds(百叶窗) / circle(圆形) / star(星爆)
  // 三阶段流程：①半透明毛玻璃动画展开 → ②中途切换主题 → ③柔化淡出
  // ==========================================
  var ThemeToggle = (function() {
    var toggle, html, key, transitioning;
    var DURATION = 1000;
    var EFFECT = 'ripple';

    function frostColor(alpha) { return 'rgba(180,180,195,' + alpha + ')'; }
    function accentC(dark) { return dark ? 'rgba(100,116,139,0.35)' : 'rgba(148,163,184,0.4)'; }

    function glassWrap() {
      var w = document.createElement('div');
      w.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;' +
        'pointer-events:none;overflow:hidden;' +
        'backdrop-filter:saturate(0.8);';
      return w;
    }

    function commitTheme(next) {
      html.setAttribute('data-theme', next);
      localStorage.setItem(key, next);
    }

    function cleanup(wrap, delay) {
      setTimeout(function() {
        if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
        document.body.classList.remove('is-switching-theme');
        transitioning = false;
      }, delay || 200);
    }

    // ===== 效果1：水波纹（毛玻璃版） =====
    function effectRipple(next, x, y) {
      var wrap = glassWrap();
      var glass = document.createElement('div');
      glass.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;' +
        'background:' + frostColor(0) + ';' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'transition:background 600ms ease-in-out;';
      wrap.appendChild(glass);

      for (var i = 0; i < 3; i++) {
        (function(idx) {
          var wave = document.createElement('div');
          wave.style.cssText =
            'position:absolute;top:' + y + 'px;left:' + x + 'px;' +
            'width:14px;height:14px;margin:-7px 0 0 -7px;' +
            'border-radius:50%;border:2px solid ' + accentC(next === 'dark') + ';' +
            'opacity:0;transform:scale(0);' +
            'box-shadow:0 0 16px ' + accentC(next === 'dark') + ';';
          wrap.appendChild(wave);

          setTimeout(function() {
            wave.style.transition = 'transform ' + (1100 + idx * 280) + 'ms cubic-bezier(.22,1,.36,1), opacity 900ms ease-out';
            wave.style.transform = 'scale(150)';
            wave.style.opacity = '0.5';
            setTimeout(function() { wave.style.opacity = '0'; }, 400);
          }, 35 + idx * 120);
        })(i);
      }

      document.body.appendChild(wrap);
      document.body.classList.add('is-switching-theme');

      requestAnimationFrame(function() {
        glass.style.background = frostColor(0.38);
      });

      setTimeout(function() { commitTheme(next); }, DURATION * 0.42);

      setTimeout(function() {
        glass.style.transition = 'background 700ms cubic-bezier(.4,0,.2,1)';
        glass.style.background = frostColor(0);
      }, DURATION * 0.65);

      cleanup(wrap, DURATION + 400);
    }

    // ===== 效果2：对角线扫描（毛玻璃版） =====
    function effectDiagonal(next) {
      var wrap = glassWrap();

      var sweep = document.createElement('div');
      sweep.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;' +
        'clip-path:polygon(100% 0, 100% 0, 100% 0);' +
        'background:' + frostColor(0.4) + ';' +
        'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
        'transition:clip-path ' + DURATION + 'ms cubic-bezier(.4,0,.2,1);';
      wrap.appendChild(sweep);

      document.body.appendChild(wrap);
      document.body.classList.add('is-switching-theme');

      requestAnimationFrame(function() {
        sweep.style.clipPath = 'polygon(100% 0, 100% 100%, 0 100%)';
      });

      setTimeout(function() { commitTheme(next); }, DURATION * 0.38);

      setTimeout(function() {
        sweep.style.transition = 'opacity 500ms ease-out, clip-path 550ms ease-in-out';
        sweep.style.opacity = '0';
        sweep.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      }, DURATION + 50);

      cleanup(wrap, DURATION + 650);
    }

    // ===== 效果3：百叶窗/风扇叶（毛玻璃版） =====
    function effectBlinds(next) {
      var wrap = glassWrap();
      wrap.style.perspective = '1400px';

      var cols = 10;
      for (var i = 0; i < cols; i++) {
        var blade = document.createElement('div');
        blade.style.cssText =
          'position:absolute;top:0;height:100%;' +
          'left:' + (i * 100 / cols) + '%;width:' + (100 / cols + 1) + '%;' +
          'transform-origin:left center;' +
          'background:' + frostColor(0.42) + ';' +
          'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
          'transform:rotateY(-90deg);' +
          'backface-visibility:hidden;' +
          'transition:transform ' + (600 + i * 55) + 'ms cubic-bezier(.22,1,.36,1), opacity 400ms ease-out;';
        wrap.appendChild(blade);
      }

      document.body.appendChild(wrap);
      document.body.classList.add('is-switching-theme');

      requestAnimationFrame(function() {
        var blades = wrap.children;
        for (var j = 0; j < blades.length; j++) {
          (function(b) { b.style.transform = 'rotateY(0deg)'; })(blades[j]);
        }
      });

      setTimeout(function() { commitTheme(next); }, DURATION * 0.4);

      setTimeout(function() {
        var blades = wrap.children;
        for (var k = 0; k < blades.length; k++) {
          blades[k].style.transform = 'rotateY(30deg)';
          blades[k].style.opacity = '0';
        }
      }, DURATION + 120);

      cleanup(wrap, DURATION + 700);
    }

    // ===== 效果4：圆形扩散（毛玻璃版） =====
    function effectCircle(next, x, y) {
      var maxX = Math.max(x, window.innerWidth - x);
      var maxY = Math.max(y, window.innerHeight - y);
      var endR = Math.sqrt(maxX * maxX + maxY * maxY) + 200;

      var wrap = glassWrap();

      var circle = document.createElement('div');
      circle.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;' +
        'clip-path:circle(0px at ' + x + 'px ' + y + 'px);' +
        'background:' + frostColor(0.4) + ';' +
        'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
        'transition:clip-path ' + DURATION + 'ms cubic-bezier(.22,1,.36,1);';
      wrap.appendChild(circle);

      var glow = document.createElement('div');
      glow.style.cssText =
        'position:absolute;top:' + y + 'px;left:' + x + 'px;' +
        'width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;' +
        'background:radial-gradient(circle,' + accentC(next === 'dark') + ', transparent 75%);' +
        'transform:scale(0);opacity:0.7;' +
        'transition:transform ' + (DURATION + 250) + 'ms cubic-bezier(.22,1,.36,1), opacity 900ms ease-out;';
      wrap.appendChild(glow);

      document.body.appendChild(wrap);
      document.body.classList.add('is-switching-theme');

      requestAnimationFrame(function() {
        circle.style.clipPath = 'circle(' + endR + 'px at ' + x + 'px ' + y + 'px)';
        glow.style.transform = 'scale(26)';
      });

      setTimeout(function() { glow.style.opacity = '0'; }, DURATION * 0.35);
      setTimeout(function() { commitTheme(next); }, DURATION * 0.4);

      setTimeout(function() {
        circle.style.transition = 'opacity 500ms ease-out, clip-path 550ms cubic-bezier(.55,.06,.68,.19)';
        circle.style.opacity = '0';
        circle.style.clipPath = 'circle(' + (endR * 1.5) + 'px at ' + x + 'px ' + y + 'px)';
      }, DURATION + 80);

      cleanup(wrap, DURATION + 700);
    }

    // ===== 效果5：星爆扩散（毛玻璃版） =====
    function effectStar(next, x, y) {
      var wrap = glassWrap();

      var core = document.createElement('div');
      core.style.cssText =
        'position:absolute;top:' + y + 'px;left:' + x + 'px;width:8px;height:8px;' +
        'margin:-4px 0 0 -4px;border-radius:50%;' +
        'background:radial-gradient(circle,#fff 0%,' + accentC(next === 'dark') + ' 55%,transparent 100%);' +
        'box-shadow:0 0 20px 10px rgba(255,255,255,0.4), 0 0 45px 22px rgba(255,255,255,0.15);' +
        'transform:scale(0);opacity:0;' +
        'transition:transform 550ms cubic-bezier(.175,.885,.32,1.275), opacity 350ms ease-out;';
      wrap.appendChild(core);

      for (var i = 0; i < 8; i++) {
        (function(idx) {
          var ray = document.createElement('div');
          ray.style.cssText =
            'position:absolute;top:' + y + 'px;left:' + x + 'px;width:2px;height:200px;' +
            'margin:-100px 0 0 -1px;' +
            'background:linear-gradient(to bottom, ' + accentC(next === 'dark') + ', transparent);' +
            'transform-origin:center top;' +
            'transform:rotate(' + (idx * 45) + 'deg) scaleY(0);' +
            'border-radius:2px;opacity:0;' +
            'transition:transform 750ms cubic-bezier(.34,1.56,.64,1), opacity 550ms ease-out;';
          wrap.appendChild(ray);

          setTimeout(function() {
            ray.style.transform = 'rotate(' + (idx * 45) + 'deg) scaleY(1)';
            ray.style.opacity = '0.4';
          }, 45 + idx * 35);
        })(i);
      }

      document.body.appendChild(wrap);
      document.body.classList.add('is-switching-theme');

      setTimeout(function() {
        core.style.transform = 'scale(14)';
        core.style.opacity = '1';
      }, 30);

      setTimeout(function() { core.style.opacity = '0'; }, DURATION * 0.4);
      setTimeout(function() { commitTheme(next); }, DURATION * 0.38);

      setTimeout(function() {
        var ch = wrap.children;
        for (var j = 0; j < ch.length; j++) {
          ch[j].style.transition = 'opacity 450ms ease-out';
          ch[j].style.opacity = '0';
        }
      }, DURATION + 40);

      cleanup(wrap, DURATION + 600);
    }

    // ===== 主切换函数 =====
    function switchTheme() {
      if (transitioning || !toggle || !html) return;
      transitioning = true;

      var cur = html.getAttribute('data-theme') || 'light';
      var next = cur === 'dark' ? 'light' : 'dark';

      console.log('[Theme] 🔄 切换: ' + cur + ' → ' + next + ' (' + EFFECT + ')');

      var rect = toggle.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;

      switch (EFFECT) {
        case 'ripple':   effectRipple(next, x, y); break;
        case 'diagonal': effectDiagonal(next); break;
        case 'blinds':   effectBlinds(next); break;
        case 'star':     effectStar(next, x, y); break;
        default:         effectCircle(next, x, y); break;
      }
    }

    function init() {
      toggle = document.getElementById('theme-toggle');
      if (!toggle) { console.warn('[Theme] #theme-toggle 未找到'); return; }

      html = document.documentElement;
      key = 'lumin-theme';

      var saved = localStorage.getItem(key);
      if (saved) { html.setAttribute('data-theme', saved); }

      // 读取配置中的效果类型（如果有）
      try {
        if (window.LUMIN_BANNER && window.LUMIN_BANNER.themeEffect) {
          EFFECT = window.LUMIN_BANNER.themeEffect;
        }
      } catch(e) {}

      toggle.addEventListener('click', function(e) { e.preventDefault(); switchTheme(); });

      console.log('[Theme] ✓ 主题切换已初始化 (当前: ' + (html.getAttribute('data-theme') || light) + ', 效果: ' + EFFECT + ')');
    }

    return { init: init };
  })();

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
  // Search - 搜索功能（IIFE闭包版）
  // 支持：点击打开/关闭 / ESC关闭 / 点击遮罩关闭 / Ctrl+K快捷键 / 关键词高亮
  // ==========================================
  var Search = (function() {
    var toggle, modal, input, closeBtn, results;
    var indexData = [];

    function open() {
      if (!modal) return;
      modal.classList.add('active');
      if (input) { input.value = ''; input.focus(); }
      if (results) results.innerHTML = '';
      if (!indexData.length) loadIndex();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('active');
      if (input) input.value = '';
      if (results) results.innerHTML = '';
    }

    function loadIndex() {
      fetch('/index.json').then(function(r) { return r.json(); }).then(function(d) {
        indexData = d || [];
        console.log('[Search] ✓ 索已加载，共 ' + indexData.length + ' 篇文章');
      }).catch(function(e) { console.warn('[Search] 索引加载失败:', e); });
    }

    function search() {
      var q = (input ? input.value : '').trim();
      if (!q || !indexData.length) { if (results) results.innerHTML = ''; return; }
      var qLower = q.toLowerCase();

      var matched = indexData.filter(function(item) {
        var t = item.title || '', c = item.content || '', s = item.summary || '';
        return t.toLowerCase().indexOf(qLower) > -1 ||
               c.toLowerCase().indexOf(qLower) > -1 ||
               s.toLowerCase().indexOf(qLower) > -1;
      }).slice(0, 10);

      if (!results) return;

      if (matched.length === 0) {
        results.innerHTML = '<div class="search-empty">🔍 没有找到相关结果</div>';
        return;
      }

      results.innerHTML = matched.map(function(item) {
        var titleHl = highlight(item.title, q);
        var snippet = highlight(extractSnippet(item.content || item.summary || '', q, 70), q);
        var dateStr = item.date || '';
        var catHtml = (item.categories && item.categories.length)
          ? '<span class="search-result-cat">' + item.categories.join(' / ') + '</span>' : '';

        return '<a href="' + item.permalink + '" class="search-result-item">' +
          '<div class="search-result-header">' +
            '<h4 class="search-result-title">' + titleHl + '</h4>' +
            (dateStr ? '<span class="search-result-date">' + dateStr + '</span>' : '') +
          '</div>' +
          '<p class="search-result-snippet">' + snippet + '</p>' +
          catHtml +
        '</a>';
      }).join('');
    }

    function highlight(text, keyword) {
      if (!text || !keyword) return text || '';
      try {
        var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(re, '<mark class="search-highlight">$1</mark>');
      } catch(e) { return text; }
    }

    function extractSnippet(text, keyword, maxLen) {
      if (!text) return '';
      var lower = text.toLowerCase(), kl = keyword.toLowerCase();
      var idx = lower.indexOf(kl);
      if (idx === -1) return text.substring(0, maxLen).trim() + (text.length > maxLen ? '...' : '');
      var start = Math.max(0, idx - Math.floor(maxLen / 2));
      var end = Math.min(text.length, start + maxLen);
      var snippet = text.substring(start, end).trim();
      if (start > 0) snippet = '…' + snippet;
      if (end < text.length) snippet = snippet + '…';
      return snippet;
    }

    function init() {
      toggle = document.getElementById('search-toggle');
      modal = document.getElementById('search-modal');
      input = document.getElementById('search-input');
      closeBtn = document.getElementById('search-close');
      results = document.getElementById('search-results');

      if (!toggle || !modal) { console.warn('[Search] #search-toggle 或 #search-modal 未找到'); return; }

      var contentBox = null;

      toggle.addEventListener('click', function(e) { e.preventDefault(); open(); });

      if (closeBtn) closeBtn.addEventListener('click', function(e) { e.preventDefault(); closeModal(); });

      modal.addEventListener('click', function(e) {
        contentBox = contentBox || modal.querySelector('.search-modal-content');
        if (e.target === modal || (contentBox && !contentBox.contains(e.target))) {
          closeModal();
        }
      });

      document.addEventListener('click', function(e) {
        if (modal && modal.classList.contains('active')) {
          contentBox = contentBox || modal.querySelector('.search-modal-content');
          var isToggle = toggle && toggle.contains(e.target);
          var isInsideContent = contentBox && contentBox.contains(e.target);
          var isModalSelf = e.target === modal;
          if (!isToggle && !isInsideContent && !isModalSelf) {
            closeModal();
          }
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
      });

      if (input) {
        var timer;
        input.addEventListener('input', function() {
          clearTimeout(timer);
          timer = setTimeout(search, 250);
        });
        input.addEventListener('click', function(e) { e.stopPropagation(); });
      }

      loadIndex();
      console.log('[Search] ✓ 搜索功能已初始化');
    }

    return { init: init };
  })();

  // ==========================================
  // Calendar Widget
  // ==========================================
  var Calendar = (function() {
    function init() {
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

    return { init: init };
  })();

  // ==========================================
  // Visitor IP Widget
  // ==========================================
  var Visitor = (function() {
    var TIMEOUT = 8000;

    function fetchIP(el) {
      var controller = new AbortController();
      var timer = setTimeout(function() { controller.abort(); }, TIMEOUT);
      try {
        fetch('https://ip-api.com/json/?lang=zh-CN', { signal: controller.signal })
          .then(function(res) { clearTimeout(timer); return res.json(); })
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
              fallback2(el);
            }
          })
          .catch(function(err) { clearTimeout(timer); console.warn('[Visitor] ip-api失败:', err.message || err); fallback2(el); });
      } catch(e) { clearTimeout(timer); fallback2(el); }
    }

    function fallback2(el) {
      var controller = new AbortController();
      var timer = setTimeout(function() { controller.abort(); }, 6000);
      try {
        fetch('https://api.ip.sb/geoip', { signal: controller.signal })
          .then(function(res) { clearTimeout(timer); if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
          .then(function(data) {
            if (data.ip) {
              var city = data.city || '';
              var region = data.region || '';
              var country = data.country_name || data.country || '';
              var isp = data.asn_organization || data.org || '';
              var locArr = [country, region, city, isp].filter(Boolean);
              var locationStr = locArr.length > 0 ? '来自：' + locArr.join('\u00b7') : '';
              el.innerHTML =
                '<div class="visitor-welcome">欢迎访问我的博客</div>' +
                '<div class="visitor-ip">' + data.ip + '</div>' +
                '<div class="visitor-location">' + locationStr + '</div>';
            } else {
              showError(el);
            }
          })
          .catch(function(err) { clearTimeout(timer); console.warn('[Visitor] ip.sb失败:', err.message || err); showError(el); });
      } catch(e) { clearTimeout(timer); showError(el); }
    }

    function showError(el) {
      el.innerHTML =
        '<div class="visitor-welcome">欢迎访问我的博客</div>' +
        '<div class="visitor-location">无法获取访客信息</div>';
    }

    function init() {
      var el = document.getElementById('visitor-widget');
      if (!el) return;
      fetchIP(el);
    }

    return { init: init };
  })();

  // ==========================================
  // Countdown Widget
  // ==========================================
  var Countdown = (function() {
    function renderProgress() {
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
      var dow = now.getDay() || 7;
      var weekPassed = dow, weekLeft = 7 - dow, weekPct = Math.round(dow / 7 * 100);

      var pEl = document.getElementById('cd-progress');
      if (!pEl) return;
      pEl.innerHTML =
        barHTML(yearPct, '本年还剩' + yearLeft + '天') +
        barHTML(monthPct, '本月还剩' + monthLeft + '天') +
        barHTML(weekPct, '本周还剩' + weekLeft + '天');
    }

    function barHTML(pct, label) {
      return '<div class="cd-progress-row">' +
        '<div class="cd-bar-header"><span class="cd-pct">' + pct + '%</span><span class="cd-label">' + label + '</span></div>' +
        '<div class="cd-bar-track"><div class="cd-bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
    }

    function updateEvent() {
      var el = document.querySelector('.countdown-event');
      if (!el) return;
      var target = new Date(el.dataset.date);
      if (isNaN(target.getTime())) return;
      var diff = Math.max(0, Math.ceil((target - new Date()) / 86400000));
      var daysEl = el.querySelector('.countdown-event-days');
      if (daysEl) daysEl.textContent = diff;
    }

    function init() {
      var el = document.getElementById('countdown-widget');
      if (!el) return;
      renderProgress();
      updateEvent();
      setInterval(updateEvent, 60000);
    }

    return { init: init };
  })();

  // ==========================================
  // Back to Top
  // ==========================================
  var BackToTop = (function() {
    var btn;

    function init() {
      btn = document.getElementById('back-to-top');
      if (!btn) return;
      window.addEventListener('scroll', function() { btn.classList.toggle('visible', window.scrollY > 300); });
      btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    return { init: init };
  })();

  // ==========================================
  // Header Scroll Effect
  // ==========================================
  var HeaderScroll = (function() {
    var header;

    function init() {
      header = document.querySelector('.site-header');
      if (!header) return;
      window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 100);
      });
    }

    return { init: init };
  })();

  // ==========================================
  // Scroll Down Hint
  // ==========================================
  var ScrollDownHint = (function() {
    function init() {
      var hint = document.getElementById('scroll-down-hint');
      if (!hint) return;
      hint.addEventListener('click', function() {
        var banner = document.getElementById('site-banner');
        if (banner) window.scrollTo({ top: banner.offsetHeight, behavior: 'smooth' });
      });
    }

    return { init: init };
  })();

  // ==========================================
  // Header Clock
  // ==========================================
  var HeaderClock = (function() {
    var clock, timer;

    function update() {
      if (!clock) return;
      var now = new Date();
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      var s = String(now.getSeconds()).padStart(2, '0');
      clock.textContent = h + ':' + m + ':' + s;
    }

    function init() {
      clock = document.getElementById('header-clock');
      if (!clock) { console.warn('[Clock] #header-clock 未找到'); return; }
      update();
      timer = setInterval(update, 1000);
      console.log('[Clock] ✓ 时钟已启动');
    }

    return { init: init };
  })();

  // ==========================================
  // TocCollapsible - 目录子级折叠
  // ==========================================
  var TocCollapsible = (function() {
    var tocNav;

    function init() {
      tocNav = document.getElementById('toc-nav');
      if (!tocNav) return;

      // 找到所有有子级 ul 的 li，插入折叠按钮
      var items = tocNav.querySelectorAll('li');
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
          toggleItem(toggle, childUl);
        });
      });

      // 根据 hugo.toml 配置决定是否折叠子目录
      if (!(window.siteConfig && window.siteConfig.tocExpandAll)) {
        autoCollapse();
      }
    }

    function toggleItem(toggle, ul) {
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
        setTimeout(function() { if (!ul.classList.contains('collapsed')) ul.style.maxHeight = ''; }, 320);
      }
    }

    function autoCollapse() {
      var subUls = tocNav.querySelectorAll('ul ul');
      subUls.forEach(function(ul) {
        var parentLi = ul.parentElement;
        var toggle = parentLi.querySelector('.toc-toggle');
        if (toggle && toggle.classList.contains('expanded')) {
          toggleItem(toggle, ul);
        }
      });
    }

    return { init: init };
  })();

  // ==========================================
  // TOC Scroll Highlight - 目录滚动高亮（无跳动稳定版）
  // ==========================================
  var TocHighlight = (function() {
    var tocNav, tocLinks, headingsData, activeLink, scrollTimer;
    var maxRetries = 8, retryDelay = 200, currentRetry = 0;
    var lastScrollY = 0, isScrollingDown = false, lockTimer = null;

    function setActive(link) {
      if (activeLink === link) return;
      if (activeLink) { activeLink.classList.remove('active'); activeLink.style.cssText = ''; }
      link.classList.add('active');
      link.style.cssText = 'background:var(--accent-color,#3b82f6)!important;color:#fff!important;font-weight:600!important;border-left:3px solid var(--accent-color,#3b82f6)!important;padding-left:12px!important;border-radius:0 6px 6px 0!important;box-shadow:0 2px 8px rgba(59,130,246,.25)!important;';
      activeLink = link;
    }

    function updateFromScroll() {
      if (!headingsData || !headingsData.length || !tocNav) return;

      var currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      isScrollingDown = currentScrollY > lastScrollY;
      lastScrollY = currentScrollY;

      var current = null;

      if (isScrollingDown) {
        for (var i = headingsData.length - 1; i >= 0; i--) {
          if (headingsData[i].el.getBoundingClientRect().top <= 120) {
            current = headingsData[i].link;
            break;
          }
        }
      } else {
        for (var j = 0; j < headingsData.length; j++) {
          if (headingsData[j].el.getBoundingClientRect().top >= 80) {
            current = j > 0 ? headingsData[j-1].link : headingsData[0].link;
            break;
          }
          if (j === headingsData.length - 1) current = headingsData[j].link;
        }
      }

      if (current) { setActive(current); }
      else if (currentScrollY < 50) {
        if (activeLink) { activeLink.classList.remove('active'); activeLink.style.cssText = ''; activeLink = null; }
      }
    }

    function init() {
      tocNav = document.getElementById('toc-nav');
      if (!tocNav) { console.warn('[TOC] #toc-nav 未找到'); scheduleRetry(); return; }

      tocLinks = tocNav.querySelectorAll('a[href^="#"]');
      if (!tocLinks.length) { console.warn('[TOC] 链接为空'); scheduleRetry(); return; }

      headingsData = [];
      var validCount = 0;

      for (var li = 0; li < tocLinks.length; li++) {
        (function(link) {
          var href = link.getAttribute('href');
          if (!href || href === '#' || href.length < 2) return;
          var id = href.slice(1);
          var heading = document.getElementById(id);
          if (!heading) { try { heading = document.getElementById(decodeURIComponent(id)); } catch(e){} }
          if (!heading) {
            var txt = link.textContent.trim().toLowerCase().replace(/\s+/g,' ');
            var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
            for (var hi=0;hi<hs.length;hi++) {
              var ht = hs[hi].textContent.trim().toLowerCase().replace(/\s+/g,' ');
              if (ht===txt || ht.indexOf(txt)!==-1 || txt.indexOf(ht)!==-1) { heading=hs[hi]; break; }
            }
          }
          if (heading) { validCount++; headingsData.push({el:heading,link:link}); }
        })(tocLinks[li]);
      }

      if (validCount === 0) { console.warn('[TOC] 无标题映射 ('+currentRetry+'/'+maxRetries+')'); scheduleRetry(); return; }

      console.log('%c[TOC] ✓ 初始化成功！'+validCount+'/'+tocLinks.length+' 个标题（无跳动版）','color:#059669;font-weight:bold');

      window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(updateFromScroll, 50);
      }, {passive:true});

      setTimeout(updateFromScroll, 100);
      setTimeout(updateFromScroll, 500);
    }

    function scheduleRetry() {
      if (currentRetry < maxRetries) {
        currentRetry++;
        var d=Math.round(retryDelay);
        console.log('[TOC] 重试 '+currentRetry+'/'+maxRetries+' ('+d+'ms)');
        setTimeout(init,d);
        retryDelay*=1.3;
      } else { console.error('[TOC] ✗ 达到最大重试次数'); }
    }

    return {
      init: init,
      setActive: setActive,
      get headingsData(){return headingsData;},
      get activeLink(){return activeLink;}
    };
  })();

  // ==========================================
  // Mobile Category Dropdown - 移动端分类折叠
  // ==========================================
  var MobileCategory = (function() {
    function init() {
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

    return { init: init };
  })();

  // ==========================================
  // Archive Collapsible - 归档页年份/月份折叠
  // ==========================================
  var ArchiveCollapsible = (function() {
    function init() {
      var container = document.getElementById('archives-timeline');
      if (!container) return;

      container.querySelectorAll('.archive-year-header[data-toggle="year"]').forEach(function(title) {
        title.addEventListener('click', function() {
          this.closest('.archive-year').classList.toggle('collapsed');
        });
      });

      container.querySelectorAll('.archive-month-header[data-toggle="month"]').forEach(function(title) {
        title.addEventListener('click', function(e) {
          e.stopPropagation();
          this.closest('.archive-month').classList.toggle('collapsed');
        });
      });
    }

    return { init: init };
  })();

  // ==========================================
  // CodeBlock - 代码块复制按钮 + 折叠/展开
  // ==========================================
  var CodeBlock = (function() {
    var MAX_HEIGHT = 300;

    var LANG_MAP = {
      'js':'JavaScript','javascript':'JavaScript','ts':'TypeScript','typescript':'TypeScript',
      'py':'Python','python':'Python','rb':'Ruby','ruby':'Ruby','php':'PHP',
      'java':'Java','kt':'Kotlin','kotlin':'Kotlin','swift':'Swift','go':'Go','rs':'Rust','rust':'Rust',
      'c':'C','cpp':'C++','csharp':'C#','cs':'C#',
      'css':'CSS','scss':'SCSS','sass':'Sass','less':'Less',
      'html':'HTML','xml':'XML','svg':'SVG','markdown':'Markdown','md':'Markdown',
      'sql':'SQL','sh':'Shell','bash':'Shell','shell':'Shell','zsh':'Zsh','powershell':'PowerShell','ps1':'PowerShell',
      'json':'JSON','yaml':'YAML','yml':'YAML','toml':'TOML','ini':'INI','conf':'Conf',
      'dockerfile':'Docker','docker':'Docker','makefile':'Makefile',
      'vim':'Vimscript','lua':'Lua','r':'R','perl':'Perl','scala':'Scala','groovy':'Groovy',
      'diff':'Diff','git':'Git','log':'Log','regex':'Regex','text':'Text','plaintext':'Plain Text'
    };

    function getLangLabel(codeEl) {
      var cls = (codeEl.className || '');
      var match = cls.match(/language-(\w+)/i);
      if (!match) return '';
      var lang = match[1].toLowerCase();
      return LANG_MAP[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
    }

    function init() {
      var blocks = document.querySelectorAll('.post-content pre');
      if (!blocks.length) return;

      blocks.forEach(function(pre) {
        var codeEl = pre.querySelector('code');
        if (!codeEl) return;
        if (pre.closest('.code-wrapper')) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        var toolbar = document.createElement('div');
        toolbar.className = 'code-toolbar';

        var langLabel = getLangLabel(codeEl);
        if (langLabel) {
          var label = document.createElement('span');
          label.className = 'code-lang-label';
          label.textContent = langLabel;
          toolbar.appendChild(label);
        }

        var btnGroup = document.createElement('span');
        btnGroup.className = 'code-btn-group';

        var toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'code-toggle-btn';
        toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
        toggleBtn.innerHTML =
          '<svg class="toggle-icon-collapse" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 20 16 14"/><line x1="20" y1="4" x2="12.01" y2="12"/></svg>' +
          '<span>\u6298\u53e0</span>';

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'code-copy-btn';
        copyBtn.setAttribute('aria-label', '\u590d\u5236\u4ee3\u7801');
        copyBtn.innerHTML =
          '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          '<svg class="check-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<span class="copy-text">复制</span>';

        btnGroup.appendChild(toggleBtn);
        btnGroup.appendChild(copyBtn);
        toolbar.appendChild(btnGroup);
        wrapper.appendChild(toolbar);

        var expandBar = document.createElement('div');
        expandBar.className = 'code-expand-bar';
        expandBar.style.display = 'none';
        var expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
          '<span>\u67e5\u770b\u5168\u90e8</span>';
        expandBar.appendChild(expandBtn);
        wrapper.appendChild(expandBar);

        requestAnimationFrame(function() {
          var actualHeight = pre.scrollHeight;
          if (actualHeight > MAX_HEIGHT) {
            wrapper.classList.add('collapsed');
            expandBar.style.display = 'flex';
            toggleBtn.style.display = 'inline-flex';
          } else {
            toggleBtn.style.display = 'none';
          }
        });

        toggleBtn.addEventListener('click', function() {
          var isCollapsed = wrapper.classList.contains('collapsed');
          if (isCollapsed) {
            wrapper.classList.remove('collapsed');
            wrapper.classList.add('expanded');
            expandBar.style.display = 'none';
            toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
            toggleBtn.innerHTML =
              '<svg class="toggle-icon-expand" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 10 12 4 6 10"/><line x1="4" y1="20" x2="11.99" y2="12"/></svg>' +
              '<span>\u6298\u53e0</span>';
          } else {
            wrapper.classList.remove('expanded');
            wrapper.classList.add('collapsed');
            expandBar.style.display = 'flex';
            toggleBtn.setAttribute('aria-label', '\u5c55\u5f00\u4ee3\u7801\u5757');
            toggleBtn.innerHTML =
              '<svg class="toggle-icon-collapse" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 20 16 14"/><line x1="20" y1="4" x2="12.01" y2="12"/></svg>' +
              '<span>\u6298\u53e0</span>';
          }
        });

        expandBtn.addEventListener('click', function() {
          wrapper.classList.remove('collapsed');
          wrapper.classList.add('expanded');
          expandBar.style.display = 'none';
          toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
          toggleBtn.innerHTML =
            '<svg class="toggle-icon-expand" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 10 12 4 6 10"/><line x1="4" y1="20" x2="11.99" y2="12"/></svg>' +
            '<span>\u6298\u53e0</span>';
        });

        copyBtn.addEventListener('click', function() {
          var text = codeEl.textContent || '';
          navigator.clipboard.writeText(text).then(function() {
            copyBtn.classList.add('copied');
            setTimeout(function() { copyBtn.classList.remove('copied'); }, 2000);
          }).catch(function() {});
        });
      });
    }

    return { init: init };
  })();

  // ==========================================
  // Reading Progress Bar - 阅读进度条
  // ==========================================
  var ReadingProgress = (function() {
    var bar, fill, article;

    function update() {
      if (!article || !fill) return;
      var articleRect = article.getBoundingClientRect();
      var articleTop = articleRect.top + window.scrollY;
      var articleHeight = article.offsetHeight;
      var windowHeight = window.innerHeight;
      var scrolled = Math.max(0, window.scrollY - articleTop + windowHeight * 0.3);
      var total = articleHeight - windowHeight * 0.3;
      var progress = Math.min(100, Math.max(0, (scrolled / total) * 100));
      fill.style.width = progress.toFixed(2) + '%';
    }

    function init() {
      bar = document.getElementById('reading-progress');
      fill = document.querySelector('.reading-progress-fill');
      if (!bar || !fill) return;

      article = document.querySelector('.single-post');
      if (!article) return;

      window.addEventListener('scroll', function() { update(); }, { passive: true });
      update();
    }

    return { init: init };
  })();

  // ==========================================
  // FriendLinkCount - 仅获取友链数量，不检测可用性
  // ==========================================
  var FriendLinkCount = (function() {
    function init() {
      var grid = document.querySelector('.friends-grid');
      if (!grid) return;
      var count = grid.querySelectorAll('.friend-card').length;
      var totalEl = document.getElementById('friend-link-total');
      var statRow = document.getElementById('stats-friend-links');
      if (totalEl) totalEl.textContent = count;
      if (statRow) statRow.style.display = '';
    }

    return { init: init };
  })();

  // Initialize all modules（每个模块独立 try-catch，防止单个模块错误导致全部中断）
  // ==========================================
  document.addEventListener('DOMContentLoaded', function() {
    var coreModules = [
      { name: 'HeaderScroll',     fn: HeaderScroll.init },
      { name: 'HeaderClock',      fn: HeaderClock.init },
      { name: 'BannerSlideshow',  fn: BannerSlideshow.init },
      { name: 'Typewriter',       fn: Typewriter.init },
      { name: 'ThemeToggle',      fn: ThemeToggle.init },
      { name: 'MobileMenu',       fn: MobileMenu.init },
      { name: 'MobileCategory',   fn: MobileCategory.init },
      { name: 'Search',           fn: Search.init },
      { name: 'Calendar',         fn: Calendar.init },
      { name: 'Visitor',          fn: Visitor.init },
      { name: 'Countdown',        fn: Countdown.init },
      { name: 'BackToTop',        fn: BackToTop.init },
      { name: 'ScrollDownHint',   fn: ScrollDownHint.init },
      { name: 'ArchiveCollapsible', fn: ArchiveCollapsible.init },
      { name: 'CodeBlock',        fn: CodeBlock.init },
      { name: 'ReadingProgress',  fn: ReadingProgress.init },
      { name: 'FriendLinkCount',  fn: FriendLinkCount.init }
    ];

    for (var i = 0; i < coreModules.length; i++) {
      try {
        coreModules[i].fn();
      } catch(e) {
        console.warn('[Lumin] ❌ 模块 ' + coreModules[i].name + ' 初始化失败:', e.message || e);
      }
    }

    console.log('[Lumin] ✓ 核心模块初始化完成');
  });

  // 延迟初始化 TOC 相关模块（多重保险机制）
  // ==========================================
  function initTocModules() {
    console.log('[Lumin] 🚀 开始初始化 TOC 模块...');

    var tocModules = [
      { name: 'TocCollapsible',   fn: TocCollapsible.init },
      { name: 'TocHighlight',     fn: TocHighlight.init }
    ];

    for (var i = 0; i < tocModules.length; i++) {
      try {
        tocModules[i].fn();
      } catch(e) {
        console.warn('[Lumin] ❌ 模块 ' + tocModules[i].name + ' 初始化失败:', e.message || e);
      }
    }

    console.log('[Lumin] ✓ TOC 模块延迟初始化完成');
  }

  // 多重触发机制确保执行
  var tocInitDone = false;

  function safeInitToc() {
    if (tocInitDone) return;
    tocInitDone = true;
    initTocModules();
  }

  // 方式1：立即尝试（DOM 可能已就绪）
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(safeInitToc, 100);
  } else {
    // 方式2：DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(safeInitToc, 100);
    });
  }

  // 方式3：load 事件（兜底）
  window.addEventListener('load', function() {
    setTimeout(safeInitToc, 200);
  });

  // 方式4：超时强制执行（最终兜底）
  setTimeout(function() {
    if (!tocInitDone) {
      console.warn('[Lumin] ⚠️ TOC 模块未及时初始化，强制执行');
      safeInitToc();
    }
  }, 3000);  // 3秒后强制执行

  // ==========================================
  // 全局调试接口（在浏览器控制台使用）
  // ==========================================
  window.TocDebug = {
    forceHighlight: function(index) {
      var tocNav = document.getElementById('toc-nav');
      if (!tocNav) { console.error('[TocDebug] #toc-nav 不存在'); return; }

      var links = tocNav.querySelectorAll('a[href^="#"]');
      if (!links.length) { console.error('[TocDebug] 无 TOC 链接'); return; }

      if (index === undefined) index = 0;
      if (index < 0 || index >= links.length) {
        console.error('[TocDebug] 索引超出范围 (0-' + (links.length-1) + ')');
        return;
      }

      TocHighlight.setActive(links[index]);
      console.log('[TocDebug] ✓ 强制高亮第 ' + (index+1) + ' 项:', links[index].textContent.trim());
    },

    showInfo: function() {
      var tocNav = document.getElementById('toc-nav');
      if (!tocNav) { console.log('[TocDebug] #toc-nav: 不存在'); return; }

      var links = tocNav.querySelectorAll('a[href^="#"]');
      console.log('[TocDebug] ===== TOC 调试信息 =====');
      console.log('[TocDebug] TOC 容器:', tocNav);
      console.log('[TocDebug] 链接数量:', links.length);
      console.log('[TocDebug] 当前高亮:', TocHighlight.activeLink ? TocHighlight.activeLink.textContent.trim() : '无');

      links.forEach(function(link, i) {
        var href = link.getAttribute('href');
        var id = href.slice(1);
        var heading = document.getElementById(id);
        console.log(
          '[TocDebug]   [' + i + '] ' +
          link.textContent.trim().substring(0, 30) +
          (heading ? ' ✓' : ' ✗ 标题不存在')
        );
      });

      console.log('[TocDebug] headingsData 数量:', TocHighlight.headingsData ? TocHighlight.headingsData.length : 0);
      console.log('[TocDebug] =========================');
    },

    reinit: function() {
      TocHighlight.currentRetry = 0;
      TocHighlight.retryDelay = 300;
      TocHighlight.init();
      console.log('[TocDebug] ✓ 手动重新初始化 TocHighlight');
    },

    testScroll: function() {
      console.log('%c[TocDebug] 🔄 测试滚动高亮...', 'color:#059669;font-weight:bold');

      if (!TocHighlight.headingsData || !TocHighlight.headingsData.length) {
        console.error('[TocDebug] ❌ headingsData 为空！请先点击"重置"按钮');
        alert('❌ 初始化失败，请点击"重置"按钮重新初始化');
        return;
      }

      var btn = document.getElementById('btn-test-scroll');
      if (btn) {
        btn.textContent = '⏳ 测试中...';
        btn.style.opacity = '0.7';
      }

      // 模拟滚动效果 - 依次高亮每个标题
      var index = 0;
      var self = this;

      function highlightNext() {
        if (index < TocHighlight.headingsData.length) {
          var data = TocHighlight.headingsData[index];
          TocHighlight.setActive(data.link);
          console.log('[TocDebug] → 高亮 [' + index + ']:', data.link.textContent.trim().substring(0, 25));
          index++;
          setTimeout(highlightNext, 800);  // 每 800ms 切换一个
        } else {
          console.log('%c[TocDebug] ✓ 测试完成！', 'color:#059669;font-weight:bold');
          if (btn) {
            btn.textContent = '🔄 测试滚动';
            btn.style.opacity = '1';
          }
        }
      }

      highlightNext();
    }
  };

  // PWA - 安装提示（beforeinstallprompt 事件）
  // ==========================================
  var PWAInstall = (function() {
    var deferredPrompt = null;
    var dismissed = false;

    function showPrompt() {
      if (dismissed || !deferredPrompt || document.querySelector('.pwa-install-prompt')) return;

      var banner = document.createElement('div');
      banner.className = 'pwa-install-prompt';
      banner.innerHTML =
        '<img class="pwa-icon" src="' + (document.querySelector('link[rel="apple-touch-icon"]')?.href || '/apple-touch-icon.png') + '" alt="">' +
        '<div class="pwa-text"><strong>添加到主屏</strong><small>离线访问，更佳体验</small></div>' +
        '<button class="btn-accept">安装</button>' +
        '<button class="btn-dismiss">稍后</button>';

      banner.querySelector('.btn-accept').addEventListener('click', install);
      banner.querySelector('.btn-dismiss').addEventListener('click', dismiss);

      document.body.appendChild(banner);
    }

    function install() {
      var prompt = deferredPrompt;
      if (prompt && prompt.prompt) {
        prompt.prompt();
        prompt.userChoice.then(function(choiceResult) {
          console.log('[PWA] 用户选择:', choiceResult.outcome);
          document.querySelector('.pwa-install-prompt')?.remove();
        });
      }
    }

    function dismiss() {
      dismissed = true;
      sessionStorage.setItem('pwa-dismissed', '1');
      document.querySelector('.pwa-install-prompt')?.remove();
    }

    function init() {
      window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;

        if (!sessionStorage.getItem('pwa-dismissed')) {
          setTimeout(showPrompt, 3000);
        }
      });

      window.addEventListener('appinstalled', function() {
        deferredPrompt = null;
        var el = document.querySelector('.pwa-install-prompt');
        if (el) el.remove();
        console.log('[PWA] 已安装到主屏');
      });
    }

    return { init: init };
  })();

  PWAInstall.init();

  // PDF 导出 & 打印（仅文章页）
  // ==========================================
  var PDFExport = (function() {

    function loadScript(src, callback) {
      if (window.html2pdf && window.html2pdf().set) return callback();
      var s = document.createElement('script');
      s.src = s.dataset.fallbackSrc || src;
      s.onerror = function() {
        var f = document.createElement('script');
        f.src = src.replace('cdnjs', 'unpkg').replace('@0.10.1', '@0.10.1/dist');
        f.onload = callback;
        document.head.appendChild(f);
      };
      s.onload = callback;
      document.head.appendChild(s);
    }

    function exportPDF() {
      var btn = document.getElementById('btn-export-pdf');
      if (!btn || btn.classList.contains('loading')) return;

      btn.classList.add('loading');

      loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
        function() {
          var element = document.querySelector('.single-post');
          if (!element) { btn.classList.remove('loading'); return; }

          var title = document.querySelector('.post-title')?.textContent || 'article';

          var opt = {
            margin: [12, 16, 12, 16],
            filename: title.replace(/[\\/:*?"<>|]/g, '_') + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              logging: false,
              backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          };

          var toolbar = document.querySelector('.post-toolbar');
          if (toolbar) toolbar.style.display = 'none';

          html2pdf().set(opt).from(element).save().then(function() {
            if (toolbar) toolbar.style.display = '';
            btn.classList.remove('loading');
          }).catch(function(err) {
            console.error('[PDF] 导出失败:', err);
            if (toolbar) toolbar.style.display = '';
            btn.classList.remove('loading');
            alert('PDF 导出失败，请重试或使用打印功能');
          });
        }
      );
    }

    function print() {
      window.print();
    }

    function init() {
      var pdfBtn = document.getElementById('btn-export-pdf');
      var printBtn = document.getElementById('btn-print-article');

      if (pdfBtn) pdfBtn.addEventListener('click', exportPDF);
      if (printBtn) printBtn.addEventListener('click', print);
    }

    return { init: init };
  })();

  PDFExport.init();

  var Lightbox = (function() {
    var overlay, imgEl, captionEl, counterEl, prevBtn, nextBtn, closeBtn;
    var currentIndex = -1;
    var images = [];
    var isOpen = false;
    var touchStartX = 0;
    var touchEndX = 0;

    function create() {
      overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML =
        '<button class="lightbox-close" aria-label="关闭"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
        '<button class="lightbox-prev" aria-label="上一张"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' +
        '<button class="lightbox-next" aria-label="下一张"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>' +
        '<div class="lightbox-img-wrapper"><img class="lightbox-image" src="" alt=""></div>' +
        '<div class="lightbox-caption"></div>' +
        '<div class="lightbox-counter"></div>';
      document.body.appendChild(overlay);
      imgEl = overlay.querySelector('.lightbox-image');
      captionEl = overlay.querySelector('.lightbox-caption');
      counterEl = overlay.querySelector('.lightbox-counter');
      prevBtn = overlay.querySelector('.lightbox-prev');
      nextBtn = overlay.querySelector('.lightbox-next');
      closeBtn = overlay.querySelector('.lightbox-close');
      overlay.addEventListener('click', function(e) { if (e.target === overlay || e.target.closest('.lightbox-close')) close(); });
      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', function() { navigate(-1); });
      nextBtn.addEventListener('click', function() { navigate(1); });
      overlay.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      overlay.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { if (diff > 0) navigate(1); else navigate(-1); }
      }, { passive: true });
    }

    function open(index) {
      if (!overlay) create();
      currentIndex = index;
      isOpen = true;
      updateImage();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      isOpen = false;
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      imgEl.src = '';
      setTimeout(function() {
        if (!isOpen) { overlay.classList.add('lb-hiding'); overlay.classList.remove('lb-hiding'); }
      }, 300);
    }

    function navigate(dir) {
      if (images.length <= 1) return;
      currentIndex = (currentIndex + dir + images.length) % images.length;
      updateImage();
    }

    function updateImage() {
      var item = images[currentIndex];
      if (!item) return;
      imgEl.style.opacity = '0';
      imgEl.onload = function() { imgEl.style.opacity = '1'; };
      imgEl.src = item.src;
      imgEl.alt = item.alt || '';
      captionEl.textContent = item.caption || '';
      counterEl.textContent = images.length > 1 ? (currentIndex + 1) + ' / ' + images.length : '';
      prevBtn.style.display = images.length > 1 ? '' : 'none';
      nextBtn.style.display = images.length > 1 ? '' : 'none';
    }

    function collectImages(container) {
      images = [];
      var imgs = container.querySelectorAll('.post-content img, .article-content img');
      imgs.forEach(function(img) {
        if (img.width < 50 || img.closest('.no-lightbox, .lightbox-overlay, .avatar')) return;
        var fig = img.closest('figure');
        var cap = fig ? fig.querySelector('figcaption') : null;
        images.push({ src: img.getAttribute('src') || img.dataset.src || '', alt: img.alt || '', caption: cap ? cap.textContent.trim() : '' });
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function() {
          var idx = images.indexOf(images.find(function(i) { return i.src === (img.getAttribute('src') || img.dataset.src); }));
          if (idx >= 0) open(idx);
        });
      });
    }

    function handleKey(e) {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape': close(); break;
        case 'ArrowLeft': navigate(-1); break;
        case 'ArrowRight': navigate(1); break;
      }
    }

    function init() {
      var content = document.querySelector('.post-content') || document.querySelector('.article-content');
      if (content) collectImages(content);
      document.addEventListener('keydown', handleKey);
    }

    return { init: init };
  })();

  var LazyLoad = (function() {
    function init() {
      if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img:not([loading])').forEach(function(img) {
          if (img.closest('.post-content, .article-content, .main-content')) {
            img.setAttribute('loading', 'lazy');
          }
        });
      } else {
        var io = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
              io.unobserve(img);
            }
          });
        }, { rootMargin: '200px' });
        document.querySelectorAll('img[data-src]').forEach(function(img) { io.observe(img); });
      }
    }
    return { init: init };
  })();

  Lightbox.init();
  LazyLoad.init();

})();
