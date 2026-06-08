function initSwup() {
  if (window._swupReady) return;
  window._swupReady = true;

  var swup = new Swup({
    containers: ['#swup-main'],
    cache: false,
    animateHistoryBrowsing: true,
    animationSelector: false,
    linkSelector: 'a[href]:not([target="_blank"]):not([download]):not([data-no-swup]):not([href^="/admin"]):not([href^="/amap"]):not([data-fancybox])'
  });

  var MAX_CACHE = 20;
  var _origCache = swup.cache;
  if (_origCache && _origCache.pages) {
    var _origSet = _origCache.setPage || _origCache.set;
    if (_origSet) {
      var patchedCache = function() {
        var pages = _origCache.pages;
        var keys = Object.keys(pages);
        if (keys.length > MAX_CACHE) {
          keys.sort(function(a, b) { return (pages[a].ts || 0) - (pages[b].ts || 0); });
          for (var i = 0; i < keys.length - MAX_CACHE; i++) {
            delete pages[keys[i]];
          }
        }
      };
      var _origPush = swup.cache.setPage ? swup.cache.setPage.bind(swup.cache) : null;
      if (_origPush) {
        swup.cache.setPage = function(page) {
          if (page) page.ts = Date.now();
          _origPush(page);
          patchedCache();
        };
      }
    }
  }

  swup.hooks.on('visit:start', function(visit) {
    if (window.ap && window.ap.audio) {
      var apAudio = window.ap.audio;
      var wasPlaying = !apAudio.paused && apAudio.src;

      if (wasPlaying) {
        window._gMusic = window._gMusic || {};
        window._gMusic.src = apAudio.src;
        window._gMusic.position = apAudio.currentTime || 0;
        window._gMusic.volume = apAudio.volume || 0.7;
        window._gMusic.playing = true;

        var list = window.ap.list;
        if (list && list.audios && list.index != null && list.audios[list.index]) {
          var a = list.audios[list.index];
          window._gMusic.name = a.name || a.title || '';
          window._gMusic.artist = a.artist || a.author || '';
          window._gMusic.cover = a.cover || '';
        }
      }

      try { window.ap.destroy(); } catch(e) {}
      window.ap = null;

      if (wasPlaying) {
        var globalAudio = document.getElementById('global-audio-player');
        if (globalAudio) {
          globalAudio.src = window._gMusic.src;
          globalAudio.volume = window._gMusic.volume || 0.7;
          globalAudio.currentTime = window._gMusic.position || 0;
          globalAudio.play().catch(function(){});
        }
      }
    }
  });

  swup.hooks.on('page:view', function() {
    var newDoc = swup.visit.to.document;
    if (newDoc) {
      var newTitle = newDoc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;
    }

    var toUrl = swup.visit.to.url;
    var isHome = toUrl === '/' || toUrl === window.location.origin + '/' || toUrl === window.location.origin;
    if (isHome) {
      document.body.classList.add('home-page');
    } else {
      document.body.classList.remove('home-page');
    }

    /* ===== 关闭移动端菜单（Swup 导航后） ===== */
    var mobileMenu = document.getElementById('mobile-menu');
    var mobileOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileOverlay) mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    var container = document.getElementById('swup-main');
    if (container) {
      var scripts = container.querySelectorAll('script:not([src])');
      for (var i = 0; i < scripts.length; i++) {
        try {
          var oldScript = scripts[i];
          var newScript = document.createElement('script');
          newScript.textContent = oldScript.textContent;
          if (oldScript.id) newScript.id = oldScript.id;
          if (oldScript.hasAttribute('data-swup-reload-script')) {
            newScript.setAttribute('data-swup-reload-script', '');
          }
          oldScript.parentNode.replaceChild(newScript, oldScript);
        } catch(e) {
          console.warn('[Swup] Script re-eval failed:', e.message || e);
        }
      }
    }

    document.dispatchEvent(new CustomEvent('swup:contentReplaced'));
  });

  window._swup = swup;
}

initSwup();
