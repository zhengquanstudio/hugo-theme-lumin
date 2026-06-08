var MUZ_CACHE_KEY = 'muz_playlist_cache';
var MUZ_CACHE_TTL = Infinity;

var _s = {
  audio: null,
  widget: null,
  mini: null,
  mwTick: false,
  hasActivePlayback: false,
  isSwupPage: false,
  muzConfig: null,
  muzLoading: false,
  closeTimer: null
};

function $(id) { return document.getElementById(id); }

function getMuzCache(platform, pid) {
  try {
    var raw = localStorage.getItem(MUZ_CACHE_KEY);
    if (!raw) return null;
    var cache = JSON.parse(raw);
    if (!cache || cache.platform !== platform || cache.pid !== pid) return null;
    if (Date.now() - cache.ts > MUZ_CACHE_TTL) return null;
    return cache.data;
  } catch(e) { return null; }
}

function setMuzCache(platform, pid, data) {
  try {
    localStorage.setItem(MUZ_CACHE_KEY, JSON.stringify({
      platform: platform, pid: pid, ts: Date.now(), data: data
    }));
  } catch(e) {}
}

function getMusicConfig() {
  var w = $('music-widget');
  if (!w || w.dataset.musicEnabled !== '1') return null;
  return {
    platform: w.dataset.defaultPlatform || 'tencent',
    volume: parseFloat(w.dataset.defaultVolume) || 0.7,
    autoplay: w.dataset.autoplay === '1',
    getPlatformId: function(p) {
      var key = 'platform' + p.charAt(0).toUpperCase() + p.slice(1);
      return w.dataset[key] || '';
    }
  };
}

function fetchPlaylistFromAPI(callback) {
  var cfg = getMusicConfig();
  if (!cfg) { if (callback) callback(false); return; }
  _s.muzConfig = cfg;

  var platform = cfg.platform;
  var pid = cfg.getPlatformId(platform);
  if (!pid) {
    console.warn('[GlobalAudio] 未配置歌单ID');
    if (callback) callback(false);
    return;
  }

  var cached = getMuzCache(platform, pid);
  if (cached) {
    handleSuccess(cached);
    return;
  }

  _s.muzLoading = true;
  updateWidgetUI();

  function handleSuccess(data) {
    _s.muzLoading = false;
    if (!data || !data.length) {
      if (callback) callback(false);
      return;
    }

    setMuzCache(platform, pid, data);

    var playlist = data.map(function(item) {
      return {
        name: item.name || item.title || '未知',
        artist: item.artist || item.author || '未知',
        cover: item.cover || item.pic || '',
        url: item.url || '',
        lrc: item.lrc || '',
        dur: 0
      };
    });

    window._gMusic = {
      src: playlist[0].url || '',
      name: playlist[0].name || '未知',
      artist: playlist[0].artist || '未知',
      cover: playlist[0].cover || '',
      volume: cfg.volume,
      position: 0,
      playing: false,
      index: 0,
      playlist: playlist,
      platform: platform
    };

    updateWidgetUI();
    if (callback) callback(true);
  }

  function handleFail() {
    _s.muzLoading = false;
    updateWidgetUI();
    if (callback) callback(false);
  }

  var url1 = 'https://api.i-meto.com/meting/api?server=' + platform + '&type=playlist&id=' + pid;
  var url2 = 'https://api.injahow.cn/meting/?server=' + platform + '&type=playlist&id=' + pid;

  fetch(url1)
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(d) { if (d && d.length) { handleSuccess(d); return; } throw new Error('empty'); })
    .catch(function() {
      fetch(url2)
        .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function(d) { if (d && d.length) { handleSuccess(d); return; } handleFail(); })
        .catch(handleFail);
    });
  setTimeout(function() { if (_s.muzLoading) handleFail(); }, 10000);
}

function tryAutoPlay() {
  if (!_s.audio || !window._gMusic || !window._gMusic.src) return;
  if (!_s.audio.paused) return;

  if (_s.audio.src !== window._gMusic.src) {
    _s.audio.src = window._gMusic.src;
    _s.audio.volume = window._gMusic.volume || 0.7;
    _s.audio.currentTime = window._gMusic.position || 0;
  }

  // 根据配置决定是否自动播放，否则仅预加载
  var cfg = getMusicConfig();
  if (cfg && cfg.autoplay) {
    _s.audio.play().then(function() {
      _s.hasActivePlayback = true;
      _s.widget && _s.widget.classList.add('playing');
      updatePlayBtn(true);
    }).catch(function() {
      _s.widget && _s.widget.classList.add('autoplay-hint');
    });
  } else {
    // 不自动播放，仅预加载（audio.src 已设置，浏览器会加载元数据）
    _s.widget && _s.widget.classList.add('autoplay-hint');
    updatePlayBtn(false);
  }
}

export function init() {
  _s.audio = $('global-audio-player');
  if (!_s.audio) return;

  if (!_s.audio.dataset.hasGlobalEvents) {
    _s.audio.volume = 0.7;
    _s.audio.addEventListener('timeupdate', onTimeUpdate);
    _s.audio.addEventListener('play', onPlay);
    _s.audio.addEventListener('pause', onPause);
    _s.audio.addEventListener('ended', onEnded);
    _s.audio.addEventListener('error', onError);
    _s.audio.dataset.hasGlobalEvents = '1';
  }

  bindWidget();
  updateWidgetUI();
  toggleWidgetForPage();

  if (_s.audio.src && !_s.audio.paused) {
    _s.hasActivePlayback = true;
    _s.widget && _s.widget.classList.add('playing');
    updatePlayBtn(true);
  }

  if (!window._gMusic || !window._gMusic.playlist || window._gMusic.playlist.length === 0) {
    fetchPlaylistFromAPI(function(success) {
      if (success) {
        tryAutoPlay();
      }
    });
  } else {
    tryAutoPlay();
  }

  positionMusicWidget();

  window.addEventListener('scroll', function() {
    if (!_s.mwTick) {
      requestAnimationFrame(function() { positionMusicWidget(); _s.mwTick = false; });
      _s.mwTick = true;
    }
  }, { passive: true });

  document.addEventListener('swup:contentReplaced', function() {
    bindWidget();
    updateWidgetUI();
    positionMusicWidget();
    toggleWidgetForPage();

    if (_s.audio && _s.audio.src && !_s.audio.paused) {
      _s.hasActivePlayback = true;
      _s.widget && _s.widget.classList.add('playing');
      updatePlayBtn(true);
    } else if (!_s.audio || !_s.audio.src) {
      _s.hasActivePlayback = false;
      _s.widget && _s.widget.classList.remove('playing');
      updatePlayBtn(false);
    }
  });
}

function bindWidget() {
  _s.widget = $('music-widget');
  _s.mini = $('mw-mini');
  var toggleBtn = $('mw-toggle');

  if (toggleBtn && !toggleBtn.dataset.bound) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleWidgetPlay();
    });
    toggleBtn.addEventListener('mouseenter', function() { openMiniPlayer(); });
    toggleBtn.addEventListener('mouseleave', function() { scheduleCloseMiniPlayer(); });
    toggleBtn.dataset.bound = '1';
  }

  if (_s.mini && !_s.mini.dataset.bound) {
    _s.mini.addEventListener('mouseenter', function() { openMiniPlayer(); });
    _s.mini.addEventListener('mouseleave', function() { scheduleCloseMiniPlayer(); });
    _s.mini.dataset.bound = '1';
  }
}

function toggleWidgetForPage() {
  if (!_s.widget) return;
  var isMusicPage = window.location.pathname.indexOf('/music') >= 0;
  if (isMusicPage) {
    _s.widget.style.display = 'none';
    // 不再暂停全局播放器，而是同步状态给音乐页面
    if (_s.audio && _s.audio.src && !_s.audio.paused) {
      window._gMusic = window._gMusic || {};
      window._gMusic.position = _s.audio.currentTime || 0;
      window._gMusic.playing = true;
    }
  } else {
    _s.widget.style.display = '';
  }
}

function openMiniPlayer() {
  cancelCloseMiniPlayer();
  if (_s.mini) _s.mini.classList.add('open');
}

function scheduleCloseMiniPlayer() {
  cancelCloseMiniPlayer();
  _s.closeTimer = setTimeout(function() {
    if (_s.mini) _s.mini.classList.remove('open');
  }, 300);
}

function cancelCloseMiniPlayer() {
  if (_s.closeTimer) { clearTimeout(_s.closeTimer); _s.closeTimer = null; }
}

function isBtnVisible(el) {
  if (!el) return false;
  if (!el.classList.contains('visible')) return false;
  var s = getComputedStyle(el);
  return s.display !== 'none';
}

function btnTopEdgePx(el) {
  var rect = el.getBoundingClientRect();
  return window.innerHeight - rect.top;
}

function calcMusicBottom() {
  var GAP = 14;
  var rocket = document.getElementById('back-to-top');
  var reading = document.getElementById('reading-mode-toggle');
  var comment = document.getElementById('scroll-to-comment');

  var tops = [];
  if (isBtnVisible(rocket)) tops.push(btnTopEdgePx(rocket));
  if (isBtnVisible(reading)) tops.push(btnTopEdgePx(reading));
  if (isBtnVisible(comment)) tops.push(btnTopEdgePx(comment));

  if (tops.length === 0) return 24;
  return Math.max.apply(null, tops) + GAP;
}

function positionMusicWidget() {
  if (!_s.widget) return;
  var px = calcMusicBottom();
  if (_s.widget._mwBot !== px) {
    _s.widget.style.bottom = px + 'px';
    _s.widget._mwBot = px;
  }
}

function updateWidgetUI() {
  if (!_s.widget) return;
  var name = $('mw-name');
  var artist = $('mw-artist');
  var cover = $('mw-cover');

  if (_s.muzLoading) {
    if (name) name.textContent = '加载歌单中...';
    if (artist) artist.textContent = '';
    if (cover) { cover.src = ''; cover.style.display = 'none'; }
    return;
  }

  var state = window._gMusic;
  if (name) name.textContent = (state && state.name) || '未在播放';
  if (artist) artist.textContent = (state && state.artist) || '';
  if (cover) {
    cover.src = (state && state.cover) || '';
    cover.style.display = (state && state.cover) ? '' : 'none';
  }
}

function onTimeUpdate() {
  if (!_s.audio || !_s.widget) return;
  var state = window._gMusic;
  if (state) {
    state.position = _s.audio.currentTime || 0;
    state.playing = !_s.audio.paused;
  }
  updateProgressUI();
  // 节流更新 widget UI（歌曲名/歌手/封面）
  if (!onTimeUpdate._ut) onTimeUpdate._ut = 0;
  var now = Date.now();
  if (now - onTimeUpdate._ut > 2000) {
    onTimeUpdate._ut = now;
    updateWidgetUI();
  }
}

function updateProgressUI() {
  var prog = $('mw-progress');
  if (!prog || !_s.audio) return;
  var pct = 0;
  if (_s.audio.duration && isFinite(_s.audio.duration)) {
    pct = (_s.audio.currentTime / _s.audio.duration) * 100;
  }
  prog.style.width = pct + '%';
  var track = prog.parentElement;
  if (track) track.setAttribute('aria-valuenow', Math.round(pct));
}

function onPlay() {
  _s.hasActivePlayback = true;
  _s.widget && _s.widget.classList.add('playing');
  updatePlayBtn(true);
  if (window._gMusic) window._gMusic.playing = true;
}

function onPause() {
  _s.widget && _s.widget.classList.remove('playing');
  updatePlayBtn(false);
  if (window._gMusic) window._gMusic.playing = false;
}

function onEnded() {
  var state = window._gMusic;
  var mode = state ? (state.playMode || 'list') : 'list';
  if (mode === 'single') {
    _s.audio.currentTime = 0;
    _s.audio.play().catch(function() {});
  } else {
    playNext();
  }
}

function onError() {
  _s.hasActivePlayback = false;
}

function updatePlayBtn(playing) {
  var btn = $('mw-play');
  if (!btn) return;
  btn.innerHTML = playing
    ? '<i class="fas fa-pause"></i>'
    : '<i class="fas fa-play"></i>';
}

function toggleWidgetPlay() {
  _s.widget && _s.widget.classList.remove('autoplay-hint');

  if (!_s.audio || !_s.audio.src) {
    if (!window._gMusic || !window._gMusic.src) return;
    _s.audio.src = window._gMusic.src;
    _s.audio.volume = window._gMusic.volume || 0.7;
    _s.audio.currentTime = window._gMusic.position || 0;
  }

  if (_s.audio.paused) {
    _s.audio.play().then(function() {
      _s.widget && _s.widget.classList.add('playing');
      updatePlayBtn(true);
    }).catch(function() {});
  } else {
    _s.audio.pause();
  }
}

function playNext() {
  var state = window._gMusic;
  if (!state || !state.src) return;

  if (state.playlist && state.playlist.length > 0) {
    var mode = state.playMode || 'list';
    var idx = state.index || 0;
    var next;
    if (mode === 'random') {
      next = Math.floor(Math.random() * state.playlist.length);
    } else {
      next = (idx + 1) % state.playlist.length;
    }
    var track = state.playlist[next];
    if (track && track.url) {
      loadTrack(track, next, true);
    }
  } else {
    _s.audio.currentTime = 0;
    _s.audio.play().catch(function() {});
  }
}

function playPrev() {
  var state = window._gMusic;
  if (!state || !state.src || !state.playlist) return;

  var mode = state.playMode || 'list';
  var idx = state.index || 0;
  // 如果播放超过3秒，重播当前歌曲
  if (_s.audio.currentTime > 3) {
    _s.audio.currentTime = 0;
    return;
  }
  var prev;
  if (mode === 'random') {
    prev = Math.floor(Math.random() * state.playlist.length);
  } else {
    prev = (idx - 1 + state.playlist.length) % state.playlist.length;
  }
  var track = state.playlist[prev];
  if (track && track.url) {
    loadTrack(track, prev, true);
  }
}

function loadTrack(track, index, autoPlay) {
  if (!_s.audio || !track.url) return;

  _s.audio.src = track.url;
  _s.audio.volume = window._gMusic ? (window._gMusic.volume || 0.7) : 0.7;

  if (!window._gMusic) window._gMusic = {};
  window._gMusic.src = track.url;
  window._gMusic.name = track.name || track.title || '';
  window._gMusic.artist = track.artist || track.author || '';
  window._gMusic.cover = track.cover || track.pic || '';
  window._gMusic.position = 0;
  window._gMusic.index = index;
  window._gMusic.playing = autoPlay;

  updateWidgetUI();

  if (autoPlay) {
    _s.audio.play().then(function() {
      _s.hasActivePlayback = true;
      _s.widget && _s.widget.classList.add('playing');
      updatePlayBtn(true);
    }).catch(function() {});
  }
}

export function syncFromAPlayerEvent(ap, playlist, index, platform) {
  if (!ap || !ap.audio) return;

  window._gMusic = window._gMusic || {};

  var list = ap.list;
  if (list && list.audios && list.audios[index]) {
    var a = list.audios[index];
    window._gMusic.src = a.url || '';
    window._gMusic.name = a.name || a.title || '';
    window._gMusic.artist = a.artist || a.author || '';
    window._gMusic.cover = a.cover || '';
  }

  window._gMusic.playing = !ap.paused;
  window._gMusic.volume = ap.audio.volume;
  window._gMusic.position = ap.audio.currentTime || 0;
  window._gMusic.index = index;
  window._gMusic.playlist = playlist;
  window._gMusic.platform = platform;

  if (_s.widget) {
    updateWidgetUI();
    if (window._gMusic.playing) {
      _s.hasActivePlayback = true;
      _s.widget.classList.add('playing');
      updatePlayBtn(true);
    } else {
      _s.widget.classList.remove('playing');
      updatePlayBtn(false);
    }
  }
}

export function saveStateDirect(playlist, index, platform) {
  if (!playlist || !playlist[index]) return;
  var track = playlist[index];
  window._gMusic = {
    src: track.url || '',
    name: track.name || track.title || '未知',
    artist: track.artist || track.author || '未知',
    cover: track.cover || track.pic || '',
    volume: 0.7,
    position: 0,
    playing: false,
    index: index || 0,
    playlist: playlist,
    platform: platform || ''
  };
}

window._mwTogglePlay = toggleWidgetPlay;
window._mwPlayNext = playNext;
window._mwPlayPrev = playPrev;
window._mSyncState = syncFromAPlayerEvent;
window._mSaveStateDirect = saveStateDirect;
